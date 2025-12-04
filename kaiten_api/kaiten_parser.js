const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = 'https://developers.kaiten.ru';
const OUTPUT_MD = 'KAITEN_API.md';
const OUTPUT_JSONL = 'KAITEN_API_RAG.jsonl'; // новое имя под RAG

(async () => {
    console.log('🚀 Запуск парсера Kaiten API...');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized'],
    });

    const page = await browser.newPage();

    try {
        console.log('🌍 Открываем главную страницу:', BASE_URL);
        await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        // Ждем, чтобы SPA/React дорисовал навигацию
        await new Promise((r) => setTimeout(r, 3000));

        const links = await collectLinks(page);
        console.log(`🔗 Найдено кандидатов-ссылок: ${links.length}`);

        const mdChunks = [];
        const jsonLines = [];

        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            console.log(`[${i + 1}/${links.length}] Обработка: ${link.text} — ${link.href}`);

            try {
                await page.goto(link.href, { waitUntil: 'networkidle2', timeout: 60000 });
                await page
                    .waitForSelector('h1, h2, h3, h4, h5, h6, table', { timeout: 10000 })
                    .catch(() => {});

                const contentHtml = await page.evaluate(() => {
                    const root =
                        document.querySelector('main') ||
                        document.querySelector('.content') ||
                        document.body;
                    return root ? root.innerHTML : '';
                });

                const { markdown, endpoint } = processHtml(contentHtml, link.href);

                // Берем только реальные API-эндпоинты
                if (!endpoint || !endpoint.method || !endpoint.url) {
                    console.log('  ⚪ Не похоже на эндпоинт — пропускаем.');
                    continue;
                }

                mdChunks.push(markdown.trim());

                // 🎯 КОМПАКТНАЯ RAG-КАПСУЛА
                const ragEntry = {
                    id: endpoint.operationId,          // spaces.create-new-space
                    method: endpoint.method,           // POST
                    path: endpoint.path,               // /api/latest/...
                    title: endpoint.title,
                    docUrl: endpoint.docUrl,
                    search_content: endpoint.search_content,
                    schema: endpoint.schema,           // компактный текст (TypeScript-like)
                };

                jsonLines.push(JSON.stringify(ragEntry));

                console.log('  ✅ Эндпоинт добавлен:', endpoint.key || `${endpoint.method} ${endpoint.url}`);
            } catch (err) {
                console.error('  ⚠️ Ошибка при разборе страницы:', err.message);
            }
        }

        // Запись файлов (MD оставляем старым)
        fs.writeFileSync(
            OUTPUT_MD,
            '# Kaiten API (автогенерация)\n\n' + mdChunks.join('\n\n---\n\n') + '\n',
            'utf8'
        );
        fs.writeFileSync(OUTPUT_JSONL, jsonLines.join('\n') + '\n', 'utf8');

        console.log(`🎉 Готово! MD → ${OUTPUT_MD}, JSONL → ${OUTPUT_JSONL}`);
    } catch (err) {
        console.error('❌ Критическая ошибка:', err);
    } finally {
        await browser.close();
    }
})();

/**
 * Сбор всех внутренних ссылок на developers.kaiten.ru
 */
async function collectLinks(page) {
    return page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        const seen = new Set();
        const result = [];

        anchors.forEach((a) => {
            const href = a.href;
            const text = a.innerText.trim();

            if (!href || !text) return;
            if (!href.includes('developers.kaiten.ru')) return;
            if (href.includes('/login')) return;
            if (seen.has(href)) return;

            seen.add(href);
            result.push({ href, text });
        });

        return result;
    });
}

/**
 * HTML страницы → markdown-блок + структурированный объект endpoint
 */
function processHtml(html, docUrl) {
    const $ = cheerio.load(html);
    let md = '';

    // ---------- 1. Заголовок, метод, URL ----------

    const title =
        $('h4').first().text().trim() ||
        $('h1').first().text().trim() ||
        'Unknown Endpoint';

    md += `## ${title}\n\n`;

    const endpoint = {
        key: null,
        path: null,
        title,
        docUrl,
        method: null,
        url: null,
        headers: [],
        request: {
            extras: [],
            attributes: [],
        },
        responses: {
            table: [],
            attributes: [],
            extras: [],
        },
        text: null, // компактный summary для дебага/эмбеддингов (если пригодится)
        search_content: null,
        schema: null,
    };

    endpoint.operationId = docUrl
        .replace('https://developers.kaiten.ru/', '')
        .replace(/\//g, '.'); // "spaces.create-new-space"

    let methodFound = false;
    let urlFound = false;

    $('div, p, span, code').each((i, el) => {
        if (methodFound && urlFound) return false;

        const text = $(el).text().trim();

        if (!methodFound && /^(GET|POST|PUT|DELETE|PATCH)$/i.test(text)) {
            endpoint.method = text.toUpperCase();
            md += `**Method:** ${endpoint.method}\n`;
            methodFound = true;
        }

        if (!urlFound && /^https?:\/\//i.test(text) && text.includes('api')) {
            endpoint.url = text;
            md += `**URL:** ${endpoint.url}\n\n`;
            urlFound = true;
        }
    });

    // Если нет метода или URL — дальше нет смысла
    if (!endpoint.method || !endpoint.url) {
        return { markdown: md, endpoint: null };
    }

    // Вычисляем path и key
    try {
        const u = new URL(endpoint.url);
        endpoint.path = decodeURIComponent(u.pathname);
    } catch (e) {
        endpoint.path = endpoint.url;
    }
    endpoint.key = `${endpoint.method} ${endpoint.path}`;

    // ---------- 2. Секции + таблицы + extras ----------

    const interestingSections = [
        'Headers',
        'Attributes',
        'Responses',
        'Response Attributes',
        'Path parameters',
        'Query parameters',
    ];

    const sectionMap = new Map(); // headerNode -> { sectionTitle, extras, tables[] }

    $('table').each((i, table) => {
        const $table = $(table);
        const $header = findNearestHeader($, $table);
        if (!$header || !$header.length) return;

        const sectionTitle = $header.text().trim();
        const matchedSection = interestingSections.find((s) =>
            sectionTitle.toLowerCase().includes(s.toLowerCase())
        );
        if (!matchedSection) return;

        let section = sectionMap.get($header[0]);
        if (!section) {
            const extras = collectSectionExtras($, $header, $table);
            section = { sectionTitle, extras, tables: [] };
            sectionMap.set($header[0], section);
        }

        section.tables.push($table);
    });

    if (sectionMap.size === 0) {
        // нет таблиц → это скорее всего не страница конкретного API
        return { markdown: md, endpoint: null };
    }

    for (const section of sectionMap.values()) {
        const titleLower = section.sectionTitle.toLowerCase();
        md += `### ${section.sectionTitle}\n\n`;

        if (section.extras.length > 0) {
            md += `_${section.extras.join(' • ')}_\n\n`;
        }

        for (const $table of section.tables) {
            // Markdown-таблица (для людей)
            md += parseTableToMarkdown($, $table) + '\n';

            // Структурные данные (для JSON/RAG)
            const tableObjects = tableToObjects($, $table);

            if (titleLower.includes('headers')) {
                endpoint.headers.push(...tableObjects);
            } else if (titleLower.includes('response attributes')) {
                endpoint.responses.attributes.push(...tableObjects);
            } else if (titleLower.includes('responses') && !titleLower.includes('attributes')) {
                endpoint.responses.table.push(...tableObjects);
            } else if (titleLower.includes('attributes')) {
                endpoint.request.attributes.push(...tableObjects);
            } else if (titleLower.includes('path parameters') || titleLower.includes('query parameters')) {
                // при желании можно вынести в endpoint.pathParams / queryParams
            }
        }

        if (titleLower.includes('attributes') && !titleLower.includes('response')) {
            endpoint.request.extras.push(...section.extras);
        }
        if (titleLower.includes('response') && titleLower.includes('attributes')) {
            endpoint.responses.extras.push(...section.extras);
        }
    }

    // Чистим дубли в extras
    endpoint.request.extras = Array.from(new Set(endpoint.request.extras));
    endpoint.responses.extras = Array.from(new Set(endpoint.responses.extras));

    // ---------- 3. Компактное текстовое описание + RAG поля ----------

    endpoint.text = buildTextSummary(endpoint);           // как раньше
    endpoint.search_content = buildSearchContent(endpoint); // для поиска
    endpoint.schema = buildSchemaMarkdown(endpoint);        // компактный "кодоподобный" формат

    return { markdown: md, endpoint };
}

/**
 * Для RAG — строка, по которой удобно искать эндпоинты
 */
function buildSearchContent(endpoint) {
    const parts = [];

    parts.push(`${endpoint.method} ${endpoint.path} — ${endpoint.title}`);

    if (endpoint.request?.attributes?.length > 0) {
        const names = endpoint.request.attributes.map(a => a.Name).join(', ');
        parts.push(`Request: ${names}`);
    }

    if (endpoint.responses?.attributes?.length > 0) {
        const names = endpoint.responses.attributes.map(a => a.Name).join(', ');
        parts.push(`Response: ${names}`);
    }

    return parts.join('. ');
}

/**
 * Мини-форматтер одной строки атрибута под RAG
 */
function formatAttrLine(attr) {
    const rawName = attr.Name || '';
    const name = rawName.replace('(required)', '').trim();
    const isRequired = rawName.toLowerCase().includes('required');

    // Тип
    let type = (attr.Type || 'any').trim() || 'any';
    // убираем служебное слово "Schema", чтобы не плодить токены
    type = type.replace(/\s*schema\b/i, '').trim(); // "object Schema" → "object"

    const desc = (attr.Description || '').trim();
    const constr = (attr.Constraints || '').trim();

    const parts = [];

    // имя
    parts.push(`- \`${name}\``);

    // тип (+ required, если надо)
    const typeBits = [type];
    if (isRequired) typeBits.push('required');
    parts.push(`(${typeBits.join(', ')})`);

    // описание
    if (desc) parts.push(`: ${desc}`);

    // ограничения
    if (constr) parts.push(` [${constr}]`);

    return parts.join(' ');
}


/**
 * Собрать компактную "схему" эндпоинта для поля schema в JSONL
 */
function buildSchemaMarkdown(ep) {
    const lines = [];

    lines.push(`## ${ep.title}`);
    lines.push(`${ep.method} ${ep.path}`);
    lines.push(`Doc: ${ep.docUrl}`);
    lines.push('');

    if (ep.request.attributes && ep.request.attributes.length) {
        lines.push('### Request Body');
        ep.request.attributes.forEach(a => {
            lines.push(formatAttrLine(a));
        });
        lines.push('');
    }

    let desc = 'Success';
    let rtype = 'Object';
    if (ep.responses.table && ep.responses.table.length) {
        const t = ep.responses.table[0];
        desc = t['Description'] || desc;
        rtype = t['Response type'] || rtype;
    }

    lines.push(`### Response (${desc})`);
    lines.push(`Returns ${rtype}:`);

    if (ep.responses.attributes && ep.responses.attributes.length) {
        ep.responses.attributes.forEach(a => {
            lines.push(formatAttrLine(a));
        });
    } else {
        lines.push('- (no documented fields)');
    }

    lines.push('');

    return lines.join('\n');
}

/**
 * Ищем ближайший заголовок (h1..h6) выше по DOM для заданной таблицы
 */
function findNearestHeader($, $table) {
    let $node = $table;

    while ($node.length) {
        let $prev = $node.prev();

        while ($prev.length) {
            if ($prev.is('h1, h2, h3, h4, h5, h6')) {
                return $prev;
            }

            const $headingInside = $prev.find('h1, h2, h3, h4, h5, h6').last();
            if ($headingInside.length) {
                return $headingInside;
            }

            $prev = $prev.prev();
        }

        $node = $node.parent();
    }

    return null;
}

/**
 * Собираем extras (SCHEMA, кнопки и короткие подписи) вокруг заголовка секции
 */
function collectSectionExtras($, $header, $table) {
    const extras = [];
    const $parent = $header.parent();

    // 1. Внутри контейнера, где лежит заголовок (кнопка SCHEMA справа)
    $parent.contents().each((i, node) => {
        const $node = $(node);
        if ($node.is('h1, h2, h3, h4, h5, h6')) return;

        $node.find('button, a').addBack('button, a').each((j, el) => {
            const t = $(el).text().replace(/\s+/g, ' ').trim();
            if (t) extras.push(t);
        });

        const rawText = $node.text().replace(/\s+/g, ' ').trim();
        if (rawText && rawText.length <= 40) {
            extras.push(rawText);
        }
    });

    // 2. Между контейнером и таблицей
    let $node = $parent.next();
    while ($node.length && !$node.is($table)) {
        $node.find('button, a').each((i, el) => {
            const t = $(el).text().replace(/\s+/g, ' ').trim();
            if (t) extras.push(t);
        });

        const rawText = $node.text().replace(/\s+/g, ' ').trim();
        if (rawText && rawText.length <= 40) {
            extras.push(rawText);
        }

        $node = $node.next();
    }

    return Array.from(new Set(extras));
}

/**
 * Таблица → массив объектов {colName: value}
 * + лёгкая чистка мусора (пустые строки, Name="null")
 */
function tableToObjects($, $table) {
    const headers = [];
    const rows = [];

    $table.find('thead th').each((i, el) => {
        headers.push($(el).text().trim());
    });

    if (headers.length === 0) return rows;

    $table.find('tbody tr').each((i, tr) => {
        const obj = {};
        const $cells = $(tr).find('td');

        $cells.each((j, td) => {
            const $td = $(td);
            const $clone = $td.clone();

            // "required" → явный текст
            $clone.find('span').each((k, span) => {
                const spanText = $(span).text().toLowerCase();
                if (spanText.includes('required')) {
                    $(span).replaceWith(' (required)');
                }
            });

            // кнопки
            const buttonTexts = [];
            $clone.find('button').each((k, btn) => {
                const t = $(btn).text().replace(/\s+/g, ' ').trim();
                if (t) buttonTexts.push(t);
            });
            $clone.find('button').remove();

            // ссылки
            const linkTexts = [];
            $clone.find('a').each((k, a) => {
                const t = $(a).text().replace(/\s+/g, ' ').trim();
                if (t) linkTexts.push(t);
            });
            $clone.find('a').remove();

            let text = $clone.text().replace(/\s+/g, ' ').trim();
            const extras = [...buttonTexts, ...linkTexts].filter(Boolean);
            if (extras.length > 0) {
                text = [text, ...extras].filter(Boolean).join(' ');
            }

            obj[headers[j]] = text;
        });

        const values = Object.values(obj).map((v) => (v || '').trim());
        const nameVal = (obj[headers[0]] || '').trim().toLowerCase();
        const typeVal = (obj['Type'] || '').trim();

        // если Name = 'number' и Type пустой, а Description/Constraints тоже пустые — дропаем
        if (nameVal === 'number' && !typeVal && values.filter(v => v.length > 0).length <= 1) {
            return;
        }

        // 1) полностью пустая строка → дроп
        if (!values.some((v) => v.length > 0)) {
            return;
        }

        // 2) строки вида Name="null" с прочим пустым мусором → дроп
        if (nameVal === 'null' && values.filter((v) => v.length > 0).length === 1) {
            return;
        }

        rows.push(obj);
    });

    return rows;
}

/**
 * Таблица → markdown-таблица
 */
function parseTableToMarkdown($, $table) {
    let md = '';
    const headers = [];

    $table.find('thead th').each((i, el) => {
        headers.push($(el).text().trim());
    });

    if (headers.length === 0) return '';

    md += `| ${headers.join(' | ')} |\n`;
    md += `| ${headers.map(() => '---').join(' | ')} |\n`;

    $table.find('tbody tr').each((i, tr) => {
        const cells = [];

        $(tr)
            .find('td')
            .each((j, td) => {
                const $td = $(td);
                const $clone = $td.clone();

                $clone.find('span').each((k, span) => {
                    const spanText = $(span).text().toLowerCase();
                    if (spanText.includes('required')) {
                        $(span).replaceWith(' (required)');
                    }
                });

                const buttonTexts = [];
                $clone.find('button').each((k, btn) => {
                    const t = $(btn).text().replace(/\s+/g, ' ').trim();
                    if (t) buttonTexts.push(t);
                });
                $clone.find('button').remove();

                const linkTexts = [];
                $clone.find('a').each((k, a) => {
                    const t = $(a).text().replace(/\s+/g, ' ').trim();
                    if (t) linkTexts.push(t);
                });
                $clone.find('a').remove();

                let text = $clone.text().replace(/\s+/g, ' ').trim();
                const extras = [...buttonTexts, ...linkTexts].filter(Boolean);
                if (extras.length > 0) {
                    text = [text, ...extras].filter(Boolean).join(' ');
                }

                text = text.replace(/\|/g, '\\|');
                cells.push(text);
            });

        if (cells.length > 0) {
            md += `| ${cells.join(' | ')} |\n`;
        }
    });

    md += '\n';
    return md;
}

/**
 * Компактное текстовое описание эндпоинта (можно использовать или игнорировать)
 */
function buildTextSummary(ep) {
    const parts = [];

    if (ep.method && ep.url) {
        parts.push(`${ep.method} ${ep.url} — ${ep.title}.`);
    } else {
        parts.push(`${ep.title}.`);
    }

    if (ep.request && ep.request.attributes && ep.request.attributes.length) {
        const fields = ep.request.attributes
            .filter((a) => a.Name && a.Type)
            .map((a) => {
                const desc = a.Description ? ` — ${a.Description}` : '';
                return `${a.Name} (${a.Type}${desc})`;
            })
            .slice(0, 10);

        parts.push(`Request body fields: ${fields.join('; ')}.`);
    }

    if (ep.responses && ep.responses.attributes && ep.responses.attributes.length) {
        const fields = ep.responses.attributes
            .filter((a) => a.Name && a.Type)
            .map((a) => {
                const desc = a.Description ? ` — ${a.Description}` : '';
                return `${a.Name} (${a.Type}${desc})`;
            })
            .slice(0, 10);

        parts.push(`Response fields: ${fields.join('; ')}.`);
    }

    if (ep.request?.extras?.length) {
        parts.push(`Request extras: ${ep.request.extras.join(', ')}.`);
    }
    if (ep.responses?.extras?.length) {
        parts.push(`Response extras: ${ep.responses.extras.join(', ')}.`);
    }

    return parts.join(' ');
}
