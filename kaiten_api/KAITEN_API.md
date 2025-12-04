# Kaiten API (автогенерация)

## Create new space

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces

### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| title (required) | string | minLength: 1 maxLength: 256 | Space title |
| number |  |  |
| external_id | number \| string \| null |  | Any external id you want to assign to space. Not exposed in web interface |
| parent_entity_uid | string |  | Parent tree entity uid |
| for_everyone_access_role_id | string |  |  |
| sort_order | number | minimum: 0 exclusiveMinimum: 0 |  |
| work_calendar_id | string |  |  |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Space id |
| uid | string | Space uid |
| title | string | Space title |
| updated | string | Last update timestamp |
| created | string | Create date |
| archived | boolean | Space archived flag |
| access | string | Space access |
| for_everyone_access_role_id | string | Role id for everyone access |
| entity_type | string | Entity type |
| path | string | Inner path to entity |
| sort_order | number | Space sort order |
| parent_entity_uid | null \| string | Parent entity uid |
| company_id | integer | Company id |
| allowed_card_type_ids | null \| array | Allowed card types for this space |
| external_id | null \| string | External id |
| settings | object Schema | Space settings |
| users | array of objects Schema | Space users |

---

## Retrieve list of spaces

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces

### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Space id |
| uid | string | Space uid |
| title | string | Space title |
| updated | string | Last update timestamp |
| created | string | Create date |
| archived | boolean | Space archived flag |
| access | string | Space access |
| for_everyone_access_role_id | string | Role id for everyone access |
| entity_type | string | Entity type |
| path | string | Inner path to entity |
| sort_order | number | Space sort order |
| parent_entity_uid | null \| string | Parent entity uid |
| company_id | integer | Company id |
| allowed_card_type_ids | null \| array | Allowed card types for this space |
| external_id | null \| string | External id |
| settings | object Schema | Space settings |
| boards | array of objects Schema | Space boards |
| entity_uid | string | Entity uid |
| user_id | integer | User id |
| access_mod | string | User access modifier |

---

## Retrieve space

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Space id |
| uid | string | Space uid |
| title | string | Space title |
| updated | string | Last update timestamp |
| created | string | Create date |
| archived | boolean | Space archived flag |
| access | string | Space access |
| for_everyone_access_role_id | string | Role id for everyone access |
| entity_type | string | Entity type |
| path | string | Inner path to entity |
| sort_order | number | Space sort order |
| parent_entity_uid | null \| string | Parent entity uid |
| company_id | integer | Company id |
| allowed_card_type_ids | null \| array | Allowed card types for this space |
| external_id | null \| string | External id |
| settings | object Schema | Space settings |

---

## Update space

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| title | string | minLength: 1 maxLength: 256 | Space title |
| number |  |  |
| external_id | number \| string \| null |  | Any external id you want to assign to space. Not exposed in web interface |
| allowed_card_type_ids | array of integers |  |  |
| settings | object |  |  |
| access | enum | [for_everyone,by_invite] |  |
| parent_entity_uid | string \| null |  | Parent tree entity uid |
| sort_order | number | minimum: 0 exclusiveMinimum: 0 |  |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Space id |
| uid | string | Space uid |
| title | string | Space title |
| updated | string | Last update timestamp |
| created | string | Create date |
| archived | boolean | Space archived flag |
| access | string | Space access |
| for_everyone_access_role_id | string | Role id for everyone access |
| entity_type | string | Entity type |
| path | string | Inner path to entity |
| sort_order | number | Space sort order |
| parent_entity_uid | null \| string | Parent entity uid |
| company_id | integer | Company id |
| allowed_card_type_ids | null \| array | Allowed card types for this space |
| external_id | null \| string | External id |
| settings | null \| object | Space settings |

---

## Remove space

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted space id |

---

## Create new board

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}/boards

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| title (required) | string | minLength: 1 maxLength: 128 | Title of the new board |
| number |  |  |
| columns | array of objects Schema |  | Board columns. If not passed, a default column will be created. If an empty array is passed, an error will be returned. Previously created boards without columns will not be included in responses, except for requests by ID, until they have at least one column and one track. |
| lanes | array of objects Schema |  | Board lanes. If not passed, a default lane will be created. If an empty array is passed, an error will be returned and the board will not be created. Previously created boards without lanes will not be included in responses, except for requests by ID, until they have at least one column and one lane. |
| description | string \| null |  | Description |
| top | integer |  | Y coordinate of the board on space |
| left | integer |  | X coordinate of the board on space |
| default_card_type_id | integer |  | Default card type for new cards on board |
| first_image_is_cover | boolean |  | Automatically mark first uploaded card's image as card's cover |
| reset_lane_spent_time | boolean |  | Reset lane spent time when card changed lane |
| automove_cards | boolean |  | Automatically move cards depending on their children state |
| backward_moves_enabled | boolean |  | Allow automatic backward movement for summary boards |
| auto_assign_enabled | boolean |  | Automatically assign the author as a member (or responsible if the first member) when a card is moved to the column with type "in progress" or "done" |
| sort_order | number | exclusiveMinimum: 0 | Position |
| external_id | number \| string \| null |  | Any external id you want to assign to board. Not exposed in web interface |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| created | string | Create date |
| updated | string | Last update timestamp |
| id | integer | Board id |
| title | string | Board title |
| cell_wip_limits | null \| array | JSON containing wip limits rules for cells |
| external_id | null \| string | External id |
| default_card_type_id | integer | Default card type for new cards on board |
| description | string | Board description |
| email_key | string | Email key |
| move_parents_to_done | boolean | Automatically move parent cards to done when their children cards on this board is done |
| default_tags | null \| string | Default tags |
| first_image_is_cover | boolean | Automatically mark first uploaded card's image as card's cover |
| reset_lane_spent_time | boolean | Reset lane spent time when card changed lane |
| backward_moves_enabled | boolean | Allow automatic backward movement for summary boards |
| hide_done_policies | boolean | Hide done checklist policies |
| hide_done_policies_in_done_column | boolean | Hide done checklist policies only in done column |
| automove_cards | boolean | Automatically move cards depending on their children state |
| auto_assign_enabled | boolean | Automatically assign a user to the card when he/she moves the card if the user is not a member of the card |
| card_properties | null \| array of objects Schema | Properties of the board cards suggested for filling |
| columns | array of objects Schema | Board columns |
| lanes | array of objects Schema | Board lanes |
| top | integer | Y coordinate of the board on space |
| left | integer | X coordinate of the board on space |
| sort_order | number | Position |

---

## Get list of boards

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}/boards

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| created | string | Create date |
| updated | string | Last update timestamp |
| id | integer | Board id |
| title | string | Board title |
| cell_wip_limits | null \| array | JSON containing wip limits rules for cells |
| external_id | null \| string | External id |
| default_card_type_id | integer | Default card type for new cards on board |
| description | string | Board description |
| email_key | string | Email key |
| move_parents_to_done | boolean | Automatically move parent cards to done when their children cards on this board is done |
| default_tags | null \| string | Default tags |
| first_image_is_cover | boolean | Automatically mark first uploaded card's image as card's cover |
| reset_lane_spent_time | boolean | Reset lane spent time when card changed lane |
| backward_moves_enabled | boolean | Allow automatic backward movement for summary boards |
| hide_done_policies | boolean | Hide done checklist policies |
| hide_done_policies_in_done_column | boolean | Hide done checklist policies only in done column |
| automove_cards | boolean | Automatically move cards depending on their children state |
| auto_assign_enabled | boolean | Automatically assign a user to the card when he/she moves the card if the user is not a member of the card |
| card_properties | null \| array of objects Schema | Properties of the board cards suggested for filling |
| columns | array of objects Schema | Board columns |
| lanes | array of objects Schema | Board lanes |
| top | integer | Y coordinate of the board on space |
| left | integer | X coordinate of the board on space |
| sort_order | number | Position |
| type | integer | 1 - place on space with coordinates (top, left), 5 - attach to space as sidebar |

---

## Get board

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}/boards/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |
| id (required) | integer | Board ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| created | string | Create date |
| updated | string | Last update timestamp |
| id | integer | Board id |
| title | string | Board title |
| cell_wip_limits | null \| array | JSON containing wip limits rules for cells |
| external_id | null \| string | External id |
| default_card_type_id | integer | Default card type for new cards on board |
| description | string | Board description |
| email_key | string | Email key |
| move_parents_to_done | boolean | Automatically move parent cards to done when their children cards on this board is done |
| default_tags | null \| string | Default tags |
| first_image_is_cover | boolean | Automatically mark first uploaded card's image as card's cover |
| reset_lane_spent_time | boolean | Reset lane spent time when card changed lane |
| backward_moves_enabled | boolean | Allow automatic backward movement for summary boards |
| hide_done_policies | boolean | Hide done checklist policies |
| hide_done_policies_in_done_column | boolean | Hide done checklist policies only in done column |
| automove_cards | boolean | Automatically move cards depending on their children state |
| auto_assign_enabled | boolean | Automatically assign a user to the card when he/she moves the card if the user is not a member of the card |
| card_properties | null \| array of objects Schema | Properties of the board cards suggested for filling |
| columns | array of objects Schema | Board columns |
| lanes | array of objects Schema | Board lanes |
| cards | array of objects Schema | Board cards |
| top | integer | Y coordinate of the board on space |
| left | integer | X coordinate of the board on space |
| sort_order | number | Position |
| space_id | integer | Board spaceId |

---

## Update board

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}/boards/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |
| id (required) | integer | Board ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| title | string | minLength: 1 maxLength: 128 | Title of the new board |
| number |  |  |
| description | string \| null |  | Description |
| top | integer |  | Y coordinate of the board on space |
| left | integer |  | X coordinate of the board on space |
| type | enum | [1,5] | 1 - place on space with coordinates (top, left), 5 - attach to space as sidebar |
| cell_wip_limits | array |  | JSON containing wip limits rules for cells |
| default_card_type_id | integer |  | Default card type for new cards on board |
| default_tags | string \| null |  | Default tags |
| first_image_is_cover | boolean |  | Automatically mark first uploaded card's image as card's cover |
| reset_lane_spent_time | boolean |  | Reset lane spent time when card changed lane |
| automove_cards | boolean |  | Automatically move cards depending on their children state |
| backward_moves_enabled | boolean |  | Allow automatic backward movement for summary boards |
| move_parents_to_done | boolean |  | Automatically move parent cards to done when their children cards on this board is done |
| hide_done_policies | boolean |  | Hide done checklist policies |
| hide_done_policies_in_done_column | boolean |  | Hide done checklist policies only in done column |
| sort_order | number | exclusiveMinimum: 0 | Position |
| external_id | number \| string \| null |  | Any external id you want to assign to board. Not exposed in web interface |
| move_from_space_id | integer |  | Move board from space |
| auto_assign_enabled | boolean |  | Automatically assign the author as a member (or responsible if the first member) when a card is moved to the column with type "in progress" or "done" |
| card_properties | array of objects Schema |  | Suggested to fill card properties |
| null |  | Empty suggested to fill card properties |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| created | string | Create date |
| updated | string | Last update timestamp |
| id | integer | Board id |
| title | string | Board title |
| cell_wip_limits | null \| array | JSON containing wip limits rules for cells |
| external_id | null \| string | External id |
| default_card_type_id | integer | Default card type for new cards on board |
| description | string | Board description |
| email_key | string | Email key |
| move_parents_to_done | boolean | Automatically move parent cards to done when their children cards on this board is done |
| default_tags | null \| string | Default tags |
| first_image_is_cover | boolean | Automatically mark first uploaded card's image as card's cover |
| reset_lane_spent_time | boolean | Reset lane spent time when card changed lane |
| backward_moves_enabled | boolean | Allow automatic backward movement for summary boards |
| hide_done_policies | boolean | Hide done checklist policies |
| hide_done_policies_in_done_column | boolean | Hide done checklist policies only in done column |
| automove_cards | boolean | Automatically move cards depending on their children state |
| auto_assign_enabled | boolean | Automatically assign a user to the card when he/she moves the card if the user is not a member of the card |
| card_properties | null \| array of objects Schema | Properties of the board cards suggested for filling |
| columns | array of objects Schema | Board columns |
| lanes | array of objects Schema | Board lanes |
| top | integer | Y coordinate of the board on space |
| left | integer | X coordinate of the board on space |
| sort_order | number | Position |

---

## Remove board

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}/boards/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |
| id (required) | integer | Board ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| force | boolean |  | Remove cascade (all related data will be gone) |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted board id |

---

## Get sprint summary

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/sprints/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| id (required) | integer | Sprint ID |


### Headers

| Name | Value |
| --- | --- |
| Authorization | Bearer <token> |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| created | string | Sprint creation timestamp |
| updated | string | Sprint last update timestamp |
| archived | boolean | Sprint archived flag |
| id | integer | Sprint ID |
| uid | string | Sprint UID |
| board_id | integer | Board ID the sprint belongs to |
| title | string | Sprint title |
| goal | string | Sprint goal |
| active | boolean | Sprint active status |
| committed | integer | Number of committed cards |
| children_committed | integer | Number of committed child cards |
| velocity | number | Sprint velocity |
| velocity_details | object Schema | Velocity by members |
| children_velocity | number | Velocity of child cards |
| children_velocity_details | object Schema |  |
| creator_id | integer |  |
| updater_id | integer |  |
| start_date | string |  |
| finish_date | string |  |
| actual_finish_date | string |  |
| cards | array of objects Schema | List of cards in the sprint |
| cardUpdates | array of objects Schema | Card versions and states over time |
| customProperties | array of objects | List of custom properties used in sprint cards |

---

## Get sprints list

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/sprints

### Headers

| Name | Value |
| --- | --- |
| Authorization | Bearer <token> |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Sprint ID |
| uid | string | Sprint UID |
| board_id | integer | Board ID the sprint belongs to |
| title | string | Sprint title |
| goal | string | Sprint goal |
| active | boolean | Sprint active status |
| committed | integer | Number of committed cards |
| children_committed | integer | Number of committed child cards |
| velocity | number | Sprint velocity |
| velocity_details | object Schema | Velocity by members |
| children_velocity | number | Velocity of child cards |
| children_velocity_details | object Schema | Velocity details of child cards |
| creator_id | integer | User ID who created the sprint |
| updater_id | integer | User ID who last updated the sprint |
| start_date | string | Sprint start date |
| finish_date | string | Sprint planned finish date |
| actual_finish_date | string \| null | Sprint actual finish date |
| created | string | Sprint creation timestamp |
| updated | string | Sprint last update timestamp |
| archived | boolean | Sprint archived flag |

---

## Get board

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| id (required) | integer | Board ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| created | string | Create date |
| updated | string | Last update timestamp |
| id | integer | Board id |
| title | string | Board title |
| cell_wip_limits | null \| array | JSON containing wip limits rules for cells |
| external_id | null \| string | External id |
| default_card_type_id | integer | Default card type for new cards on board |
| description | string | Board description |
| email_key | string | Email key |
| move_parents_to_done | boolean | Automatically move parent cards to done when their children cards on this board is done |
| default_tags | null \| string | Default tags |
| first_image_is_cover | boolean | Automatically mark first uploaded card's image as card's cover |
| reset_lane_spent_time | boolean | Reset lane spent time when card changed lane |
| backward_moves_enabled | boolean | Allow automatic backward movement for summary boards |
| hide_done_policies | boolean | Hide done checklist policies |
| hide_done_policies_in_done_column | boolean | Hide done checklist policies only in done column |
| automove_cards | boolean | Automatically move cards depending on their children state |
| auto_assign_enabled | boolean | Automatically assign a user to the card when he/she moves the card if the user is not a member of the card |
| card_properties | null \| array of objects Schema | Properties of the board cards suggested for filling |
| columns | array of objects Schema | Board columns |
| lanes | array of objects Schema | Board lanes |
| cards | array of objects Schema | Board cards |

---

## Create new column

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{board_id}/columns

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| board_id (required) | integer | Board ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| title (required) | string | minLength: 1 maxLength: 128 | Title |
| sort_order | number | exclusiveMinimum: 0 | Position |
| type | enum | [1,2,3] | 1 - queue, 2 – in progress, 3 – done |
| last_moved_warning_after_days | integer |  | Warning appears on stale cards |
| last_moved_warning_after_hours | integer |  | Warning appears on stale cards |
| last_moved_warning_after_minutes | integer |  | Warning appears on stale cards |
| wip_limit | integer |  | Work in progress recommended limit for column |
| wip_limit_type | enum | [1,2] | 1 – card's count, 2 – card's size |
| col_count | integer |  | Width |
| archive_after_days | integer |  | Specify amont of days after which cards will be automatically archived. Works only for columns with type **done** |
| months_to_hide_cards | integer \| null |  | [Deprecated] Hide cards not moved for the last N months |
| card_hide_after_days | integer \| null |  | Hide cards not moved for the last N days |
| rules | integer | minimum: 0 | Bit mask for column rules. Rules: 1 - checklists must be checked, 2 - display FIFO order |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Column id |
| title | string | Column title |
| sort_order | number | Position |
| col_count | integer | Width |
| wip_limit | integer | Recommended limit for column |
| type | enum | 1 - queue, 2 – in progress, 3 – done |
| rules | integer | Bit mask for column rules. Rules: 1 - checklists must be checked, 2 - display FIFO order |
| board_id | integer | Board id |
| column_id | null | Parent column id |
| archive_after_days | integer | Specify amont of days after which cards will be automatically archived. Works only for columns with type **done** |
| wip_limit_type | enum | 1 – card's count, 2 – card's size |
| external_id | null \| string | External id |
| default_tags | string | Default tags |
| last_moved_warning_after_days | integer | Warning appears on stale cards |
| last_moved_warning_after_hours | integer | Warning appears on stale cards |
| last_moved_warning_after_minutes | integer | Warning appears on stale cards |
| months_to_hide_cards | null \| integer | [Deprecated] Hide cards not moved for the last N months |
| card_hide_after_days | null \| integer | Hide cards not moved for the last N days |

---

## Get list of columns

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{board_id}/columns

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| board_id (required) | integer | Board ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Column id |
| title | string | Column title |
| sort_order | number | Position |
| col_count | integer | Width |
| wip_limit | integer | Recommended limit for column |
| type | enum | 1 - queue, 2 – in progress, 3 – done |
| rules | integer | Bit mask for column rules. Rules: 1 - checklists must be checked, 2 - display FIFO order |
| board_id | integer | Board id |
| column_id | null | Parent column id |
| archive_after_days | integer | Specify amont of days after which cards will be automatically archived. Works only for columns with type **done** |
| wip_limit_type | enum | 1 – card's count, 2 – card's size |
| external_id | null \| string | External id |
| default_tags | string | Default tags |
| last_moved_warning_after_days | integer | Warning appears on stale cards |
| last_moved_warning_after_hours | integer | Warning appears on stale cards |
| last_moved_warning_after_minutes | integer | Warning appears on stale cards |
| months_to_hide_cards | null \| integer | [Deprecated] Hide cards not moved for the last N months |
| card_hide_after_days | null \| integer | Hide cards not moved for the last N days |
| pause_sla | boolean | Indicates whether the SLA timer should be paused in this column |
| subcolumns | array of objects Schema | Column subcolumns |

---

## Update column

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{board_id}/columns/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| board_id (required) | integer | Board ID |
| id (required) | integer | Column ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| title | string | minLength: 0 maxLength: 128 | Title |
| sort_order | number | exclusiveMinimum: 0 | Position |
| type | enum | [1,2,3] | 1 - queue, 2 – in progress, 3 – done |
| wip_limit | integer |  | Work in progress recommended limit for column |
| null |  | Empty work in progress recommended limit for column |
| wip_limit_type | enum | [1,2] | 1 – card's count, 2 – card's size |
| last_moved_warning_after_days | integer |  | Warning appears on stale cards |
| last_moved_warning_after_hours | integer |  | Warning appears on stale cards |
| last_moved_warning_after_minutes | integer |  | Warning appears on stale cards |
| col_count | integer |  | Width |
| archive_after_days | integer |  | Specify amount of days after which cards will be automatically archived. Works only for columns with type **done** |
| months_to_hide_cards | integer \| null |  | [Deprecated] Hide cards not moved for the last N months |
| card_hide_after_days | integer \| null |  | Hide cards not moved for the last N days |
| rules | integer | minimum: 0 | Bit mask for column rules. Rules: 1 - checklists must be checked, 2 - display FIFO order |
| default_tags | string \| null |  | Default tags |
| prev_column_id | integer |  | Column ID to move column before |
| null |  | Indicates that column should be moved to the beginning |
| next_column_id | integer |  | Column ID to move column after |
| null |  | Indicates that column should be moved to the end |
| pause_sla | boolean |  |  |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Column id |
| title | string | Column title |
| sort_order | number | Position |
| col_count | integer | Width |
| wip_limit | integer | Recommended limit for column |
| type | enum | 1 - queue, 2 – in progress, 3 – done |
| rules | integer | Bit mask for column rules. Rules: 1 - checklists must be checked, 2 - display FIFO order |
| board_id | integer | Board id |
| column_id | null | Parent column id |
| archive_after_days | integer | Specify amont of days after which cards will be automatically archived. Works only for columns with type **done** |
| wip_limit_type | enum | 1 – card's count, 2 – card's size |
| external_id | null \| string | External id |
| default_tags | string | Default tags |
| last_moved_warning_after_days | integer | Warning appears on stale cards |
| last_moved_warning_after_hours | integer | Warning appears on stale cards |
| last_moved_warning_after_minutes | integer | Warning appears on stale cards |
| months_to_hide_cards | null \| integer | [Deprecated] Hide cards not moved for the last N months |
| card_hide_after_days | null \| integer | Hide cards not moved for the last N days |

---

## Remove column

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{board_id}/columns/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| board_id (required) | integer | Board ID |
| id (required) | integer | Column ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| force | boolean |  | Remove cascade (all related data will be gone) |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted column id |

---

## Create new subcolumn

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/columns/{column_id}/subcolumns

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| column_id (required) | integer | Column ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| title (required) | string | minLength: 1 maxLength: 128 | Title |
| sort_order | number | exclusiveMinimum: 0 | Position |
| type | enum | [1,2,3] | 1 - queue, 2 – in progress, 3 – done |
| archive_after_days | integer |  | Specify amont of days after which cards will be automatically archived. Works only for columns with type **done** |
| months_to_hide_cards | integer \| null |  | [Deprecated] Hide cards not moved for the last N months |
| card_hide_after_days | integer \| null |  | Hide cards not moved for the last N days |
| col_count | integer |  | Width |
| rules | integer | minimum: 0 | Bit mask for column rules. Rules: 1 - checklists must be checked, 2 - display FIFO order |
| last_moved_warning_after_minutes | integer |  | Warning appears on stale cards |
| last_moved_warning_after_hours | integer |  | Warning appears on stale cards |
| last_moved_warning_after_days | integer |  | Warning appears on stale cards |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Column id |
| title | string | Column title |
| sort_order | number | Position |
| col_count | integer | Width |
| wip_limit | integer | Recommended limit for column |
| type | enum | 1 - queue, 2 – in progress, 3 – done |
| rules | integer | Bit mask for column rules. Rules: 1 - checklists must be checked, 2 - display FIFO order |
| board_id | integer | Board id |
| column_id | integer | Parent column id |
| archive_after_days | integer | Specify amont of days after which cards will be automatically archived. Works only for columns with type **done** |
| wip_limit_type | enum | 1 – card's count, 2 – card's size |
| external_id | null \| string | External id |
| default_tags | string | Default tags |
| last_moved_warning_after_days | integer | Warning appears on stale cards |
| last_moved_warning_after_hours | integer | Warning appears on stale cards |
| last_moved_warning_after_minutes | integer | Warning appears on stale cards |
| months_to_hide_cards | null \| integer | [Deprecated] Hide cards not moved for the last N months |
| card_hide_after_days | null \| integer | Hide cards not moved for the last N months |

---

## Get list of subcolumns

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/columns/{column_id}/subcolumns

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| column_id (required) | integer | Column ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Column id |
| title | string | Column title |
| sort_order | number | Position |
| col_count | integer | Width |
| wip_limit | integer | Recommended limit for column |
| type | enum | 1 - queue, 2 – in progress, 3 – done |
| rules | integer | Bit mask for column rules. Rules: 1 - checklists must be checked, 2 - display FIFO order |
| board_id | integer | Board id |
| column_id | integer | Parent column id |
| archive_after_days | integer | Specify amont of days after which cards will be automatically archived. Works only for columns with type **done** |
| wip_limit_type | enum | 1 – card's count, 2 – card's size |
| external_id | null \| string | External id |
| default_tags | string | Default tags |
| last_moved_warning_after_days | integer | Warning appears on stale cards |
| last_moved_warning_after_hours | integer | Warning appears on stale cards |
| last_moved_warning_after_minutes | integer | Warning appears on stale cards |
| months_to_hide_cards | null \| integer | [Deprecated] Hide cards not moved for the last N months |
| card_hide_after_days | null \| integer | Hide cards not moved for the last N months |

---

## Update subcolumn

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/columns/{column_id}/subcolumns/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| column_id (required) | integer | Column ID |
| id (required) | integer | Subcolumn ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| title | string | minLength: 1 maxLength: 128 | Title |
| sort_order | number | exclusiveMinimum: 0 | Position |
| type | enum | [1,2,3] | 1 - queue, 2 – in progress, 3 – done |
| archive_after_days | integer |  | Specify amont of days after which cards will be automatically archived. Works only for columns with type **done** |
| months_to_hide_cards | integer \| null |  | [Deprecated] Hide cards not moved for the last N months |
| card_hide_after_days | integer \| null |  | Hide cards not moved for the last N days |
| col_count | integer |  | Width |
| rules | integer | minimum: 0 | Bit mask for column rules. Rules: 1 - checklists must be checked, 2 - display FIFO order |
| default_tags | string \| null |  | Default tags |
| last_moved_warning_after_minutes | integer |  | Warning appears on stale cards |
| last_moved_warning_after_hours | integer |  | Warning appears on stale cards |
| last_moved_warning_after_days | integer |  | Warning appears on stale cards |
| prev_column_id | integer |  | Column ID to move column before |
| null |  | Indicates that column should be moved to the beginning |
| next_column_id | integer |  | Column ID to move column after |
| null |  | Indicates that column should be moved to the end |
| pause_sla | boolean |  |  |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Column id |
| title | string | Column title |
| sort_order | number | Position |
| col_count | integer | Width |
| wip_limit | integer | Recommended limit for column |
| type | enum | 1 - queue, 2 – in progress, 3 – done |
| rules | integer | Bit mask for column rules. Rules: 1 - checklists must be checked, 2 - display FIFO order |
| board_id | integer | Board id |
| column_id | integer | Parent column id |
| archive_after_days | integer | Specify amont of days after which cards will be automatically archived. Works only for columns with type **done** |
| wip_limit_type | enum | 1 – card's count, 2 – card's size |
| external_id | null \| string | External id |
| default_tags | string | Default tags |
| last_moved_warning_after_days | integer | Warning appears on stale cards |
| last_moved_warning_after_hours | integer | Warning appears on stale cards |
| last_moved_warning_after_minutes | integer | Warning appears on stale cards |
| months_to_hide_cards | null \| integer | [Deprecated] Hide cards not moved for the last N months |
| card_hide_after_days | null \| integer | Hide cards not moved for the last N months |

---

## Remove subcolumn

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/columns/{column_id}/subcolumns/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| column_id (required) | integer | Column ID |
| id (required) | integer | Subcolumn ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| force | boolean |  | Remove cascade (all related data will be gone) |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted subcolumn id |

---

## Create new lane

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{board_id}/lanes

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| board_id (required) | integer | Board ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| title (required) | string | minLength: 1 maxLength: 128 | Title |
| sort_order | number | exclusiveMinimum: 0 | Position |
| wip_limit | integer |  | Work in progress recommended limit for lane |
| wip_limit_type | enum | [1,2] | 1 – card's count, 2 – card's size |
| last_moved_warning_after_days | integer |  | Warning appears on stale cards |
| last_moved_warning_after_hours | integer |  | Warning appears on stale cards |
| last_moved_warning_after_minutes | integer |  | Warning appears on stale cards |
| row_count | integer |  | Height |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Lane id |
| title | string | Lane title |
| sort_order | number | Position |
| row_count | integer | Height |
| wip_limit | integer | Recommended limit for column |
| board_id | integer | Board id |
| default_card_type_id | null \| integer | Default card type for new cards in lane |
| wip_limit_type | enum | 1 – card's count, 2 – card's size |
| external_id | null \| string | External id |
| default_tags | string | Default tags |
| last_moved_warning_after_days | integer | Warning appears on stale cards |
| last_moved_warning_after_hours | integer | Warning appears on stale cards |
| last_moved_warning_after_minutes | integer | Warning appears on stale cards |
| condition | enum | 1 - live, 2 - archived, 3 - deleted |

---

## Get list of lanes

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{board_id}/lanes

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| board_id (required) | integer | Board ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | 1 - live, 2 - archived, 3 - deleted | Lane id |
| title | string | Lane title |
| sort_order | number | Position |
| row_count | integer | Height |
| wip_limit | integer | Recommended limit for column |
| board_id | integer | Board id |
| default_card_type_id | null \| integer | Default card type for new cards in lane |
| wip_limit_type | enum | 1 – card's count, 2 – card's size |
| external_id | null \| string | External id |
| default_tags | string | Default tags |
| last_moved_warning_after_days | integer | Warning appears on stale cards |
| last_moved_warning_after_hours | integer | Warning appears on stale cards |
| last_moved_warning_after_minutes | integer | Warning appears on stale cards |
| condition | enum | 1 - live, 2 - archived, 3 - deleted |

---

## Update lane

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{board_id}/lanes/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| board_id (required) | integer | Board ID |
| id (required) | integer | Lane ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| title | string | minLength: 0 maxLength: 128 | Title |
| sort_order | number | exclusiveMinimum: 0 | Position |
| wip_limit | integer |  | Work in progress recommended limit for lane |
| null |  | Empty work in progress recommended limit for lane |
| wip_limit_type | enum | [1,2] | 1 – card's count, 2 – card's size |
| last_moved_warning_after_days | integer |  | Warning appears on stale cards |
| last_moved_warning_after_hours | integer |  | Warning appears on stale cards |
| last_moved_warning_after_minutes | integer |  | Warning appears on stale cards |
| row_count | integer |  | Height |
| default_tags | string \| null |  | Default tags |
| default_card_type_id | integer \| null |  | Default card type for new cards in lane |
| condition | enum | [1,2] | 1 - live, 2 - archived, 3 - deleted |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Lane id |
| title | string | Lane title |
| sort_order | number | Position |
| row_count | integer | Height |
| wip_limit | integer | Recommended limit for column |
| board_id | integer | Board id |
| default_card_type_id | null \| integer | Default card type for new cards in lane |
| wip_limit_type | enum | 1 – card's count, 2 – card's size |
| external_id | null \| string | External id |
| default_tags | string | Default tags |
| last_moved_warning_after_days | integer | Warning appears on stale cards |
| last_moved_warning_after_hours | integer | Warning appears on stale cards |
| last_moved_warning_after_minutes | integer | Warning appears on stale cards |
| condition | enum | 1 - live, 2 - archived, 3 - deleted |

---

## Remove lane

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{board_id}/lanes/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| board_id (required) | integer | Board ID |
| id (required) | integer | Lane ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| force | boolean |  | Remove cascade (all related data will be gone) |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted lane id |

---

## Retrieve list of users

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/users

### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |
| company_id | integer | Company id |
| user_id | integer | User id |
| default_space_id | null \| integer | Default space |
| permissions | integer | User company permissions |
| role | enum | User role in company: 1 - owner, 2 - user, 3 - deactivated |
| email_frequency | enum | 1 - never, 2 – instantly |
| email_settings | object Schema | Email settings |
| slack_id | null \|\| integer | User slack id |
| slack_settings | null \|\| object | Slack settings |
| notification_settings | null \|\| object Schema | Notification settings |
| notification_enabled_channels | array | List of enabled channels for notifications |
| slack_private_channel_id | null \| integer | User slack private channel id |
| telegram_sd_bot_enabled | boolean | Telegram bot enable flag |
| invite_last_sent_at | string | Last invite date |
| apps_permissions | string | 0 - no access, 1 - full access to Kaiten, access to service desk denied. 2 - guest access to Kaiten, access to service desk denied. 4 - access only to service desk. 5 - full access to Kaiten and service desk. 6 - guest access to Kaiten, access to service desk |
| external | boolean | Is user external |
| last_request_date | null \| string | Date of last request |
| last_request_method | null \| string | Type of last request |
| include_inactive | boolean | Includes in the list of deactivated users |

---

## Retrieve current user

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/users/current

### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |
| company_id | integer | Company id |
| telegram_id | integer | Telegram id |
| telegram_settings | object | Telegram settings |
| user_id | integer | User id |
| default_space_id | null \| integer | Default space |
| permissions | integer | User company permissions |
| role | enum | User role in company: 1 - owner, 2 - user, 3 - deactivated |
| email_frequency | enum | 1 - never, 2 – instantly |
| email_settings | object Schema | Email settings |
| slack_id | null \|\| integer | User slack id |
| slack_settings | null \|\| object | Slack settings |
| notification_settings | null \|\| object Schema | Notification settings |
| notification_enabled_channels | array | List of enabled channels for notifications |
| slack_private_channel_id | null \| integer | User slack private channel id |
| telegram_sd_bot_enabled | boolean | Telegram bot enable flag |
| invite_last_sent_at | string | Last invite date |
| apps_permissions | string | 0 - no access, 1 - full access to Kaiten, access to service desk denied. 2 - guest access to Kaiten, access to service desk denied. 4 - access only to service desk. 5 - full access to Kaiten and service desk. 6 - guest access to Kaiten, access to service desk |
| external | boolean | Is user external |
| last_request_date | null \| string | Date of last request |
| last_request_method | null \| string | Type of last request |
| has_password | boolean | Has user password flag |

---

## Update user

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/users/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| id (required) | integer | User ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| username | string |  | Username for mentions and login |
| full_name | string | minLength: 1 maxLength: 128 | Full name |
| initials | string | minLength: 2 maxLength: 2 | Initials |
| avatar_type | enum | [1,2,3] | 1 – gravatar, 2 – initials, 3 - uploaded |
| password | string | minLength: 6 | New password |
| old_password | string \| null | minLength: 6 | Old password |
| lng | string |  | Language |
| default_space_id | integer \| null |  | Default space |
| theme | enum | [light,dark,auto] | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| email_frequency | enum | [1,2] | 1 - never, 2 – instantly |
| timezone | string |  | Time zone |
| subject_by | enum | [1,2] | 1 - id and title, 2 – action |
| email_settings | object |  | Email settings |
| telegram_settings | object |  | Telegram settings |
| slack_settings | object |  | Slack settings |
| notification_enabled_channels | array | [ inner, mobile_app, email, slack, telegram ] | List of enabled channels for notifications |
| notification_settings | object |  | Channel lists where notifications for specified events should be sent |
| ui_version | enum | [1,2] | 1 - old ui. 2 - new ui |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| updated | string | Last update timestamp |
| created | string | Create date |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| activated | boolean | User activated flag |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| sd_telegram_id | integer | Service desk telegram id |
| timezone | string | Time zone |
| news_subscription | boolean | news subscription flag |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| ui_version | enum | 1 - old ui. 2 - new ui |
| default_space_id | null \| integer | Default space |
| email_frequency | enum | 1 - never, 2 – instantly |
| email_settings | object Schema | Email settings |
| work_time_settings | object Schema | Work time settings |
| telegram_id | integer | Telegram id |
| telegram_settings | object | Telegram settings |
| has_password | boolean | Has user password flag |

---

## Create user role

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/user-roles

### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| name (required) | string | minLength: 1 maxLength: 64 | Role name |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Role name |
| company_id | integer | Company Id |
| created | string | Create date |
| updated | string | Last update timestamp |
| id | integer | Role id |
| uid | string | Role uid |

---

## Get list of user roles

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/user-roles

### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Role name |
| company_id | integer | Company Id |
| created | string | Create date |
| updated | string | Last update timestamp |
| id | integer | Role id |
| uid | string | Role uid |

---

## Get user role

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/user-roles/{role_id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| role_id (required) | integer | Role ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Role name |
| company_id | integer | Company Id |
| created | string | Create date |
| updated | string | Last update timestamp |
| id | integer | Role id |
| uid | string | Role uid |

---

## Update user role

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/user-roles/{role_id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| role_id (required) | integer | Role ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| name (required) | string | minLength: 1 maxLength: 64 | Role name |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Role name |
| company_id | integer | Company Id |
| created | string | Create date |
| updated | string | Last update timestamp |
| id | integer | Role id |
| uid | string | Role uid |

---

## Remove user role

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/user-roles/{role_id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| role_id (required) | integer | Role ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| replace_role_id (required) | integer |  | Role id to replace deleted |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Role name |
| company_id | integer | Company Id |
| created | string | Create date |
| updated | string | Last update timestamp |
| id | integer | Role id |
| uid | string | Role uid |

---

## Invite user to space

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}/users

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| email (required) | string |  | User email address |
| role_id | string |  | Role id. Preset roles : reader - '06ccb31f-426b-4fa3-b7e5-861daee95696', writer - 'a431ed00-1b32-4cc7-92b6-85e4bc7de40e', admin - '07ea3efc-a004-4d31-8683-4bb2084e209b' |
| guest | boolean |  | Set true to invite the user as a guest |
| operator_comment | string |  | Operator's comment |
| send_email | boolean |  | Whether to send email or not |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| user | object Schema | User info |
| access_record | object Schema | Access record data |
| message | string | Success message |

---

## Get list of users

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}/users

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |
| virtual | boolean | Is user virtual |
| apps_permissions | string | 0 - no access, 1 - full access to Kaiten, access to service desk denied. 2 - guest access to Kaiten, access to service desk denied. 4 - access only to service desk. 5 - full access to Kaiten and service desk. 6 - guest access to Kaiten, access to service desk |
| access_mod | string | Access modifier with inheritable access modifiers |
| own_access_mod | string | Own access modifier |
| own_role_ids | array | User role ids |
| current | boolean | flag indicating that this is the user on whose behalf the request was made |

---

## Get user

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}/users/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |
| id (required) | integer | User ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |
| virtual | boolean | Is user virtual |
| entity_uid | string | Entity uid |
| user_id | integer | User id |
| access_mod | string | Access modifier with inheritable access modifiers |

---

## Change user role and notification settings

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}/users/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |
| id (required) | integer | User ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| role_id | string |  | Role id. Preset roles : reader - '06ccb31f-426b-4fa3-b7e5-861daee95696', writer - 'a431ed00-1b32-4cc7-92b6-85e4bc7de40e', admin - '07ea3efc-a004-4d31-8683-4bb2084e209b' |
| notifications_enabled | boolean |  | Enabled or disable notifications for space events |
| space_group_id | number \| null |  | Space group id |
| settings | object |  | Space user settings |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| entity_uid | string | Entity uid |
| access_mod | string | Access modifier with inheritable access modifiers |
| own_access_mod | string | Own access modifier |
| own_role_ids | array | User role ids |
| id | integer | User id |
| user_id | integer | User id |

---

## Remove user from space

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}/users/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |
| id (required) | integer | User ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| user_id | integer | User id |
| entity_uid | string | Entity uid |
| access_mod | string | Access modifier with inheritable access modifiers |
| own_access_mod | string | Own access modifier |
| own_role_ids | null | User role ids |

---

## Get list of users

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/users

### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Id |
| uid | string | Uid |
| full_name | string | User full name |
| email | string | User email |
| avatar_initials_url | string | Default user avatar url |
| avatar_uploaded_url | string \| null | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |
| virtual | boolean | Is user virtual |
| email_blocked | null \| string | Email blocked timestamp |
| email_blocked_reason | null \| string | Email blocked reason |
| delete_requested_at | null \| string | Timestamp of delete request |
| permissions | integer | User company permissions(with inherited permissions through groups) |
| own_permissions | integer | User personal company permissions |
| user_id | integer | User id |
| company_id | integer | Company id |
| default_space_id | null \| integer | Default space |
| role | enum | User role in company: 1 - owner, 2 - user, 3 - deactivated |
| email_frequency | enum | 1 - never, 2 – instantly |
| email_settings | object Schema | Email settings |
| slack_id | null \|\| integer | User slack id |
| slack_settings | null \|\| object | Slack settings |
| notification_settings | object Schema | Notification settings |
| notification_enabled_channels | array | List of enabled channels for notifications |
| slack_private_channel_id | null \| integer | User slack private channel id |
| telegram_sd_bot_enabled | boolean | Telegram bot enable flag |
| apps_permissions | string | 0 - no access, 1 - full access to Kaiten, access to service desk denied. 2 - guest access to Kaiten, access to service desk denied. 4 - access only to service desk. 5 - full access to Kaiten and service desk. 6 - guest access to Kaiten, access to service desk |
| invite_last_sent_at | string | Last invite date |
| external | boolean | Is user external |
| last_request_date | null \| string | Date of last request |
| last_request_method | null \| string | Type of last request |
| work_time_settings | object Schema | Work time settings |
| personal_settings | object Schema | Personal settings |
| locked | boolean | Is user locked for update |
| take_licence | boolean | Flag indicating whether the user holds the company's license |
| spaces | array of objects Schema | Spaces where the user is invited |
| groups | object Schema | User groups |

---

## Update user

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/users/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| id (required) | integer | User ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| apps_permissions | integer |  | User access. 0 - no access, 1 - full access to Kaiten, access to service desk denied. 2 - guest access to Kaiten, access to service desk denied. 4 - access only to service desk. 5 - full access to Kaiten and service desk. 6 - guest access to Kaiten, access to service desk |
| temporarily_inactive | boolean |  | Temporarily inactive: user is still in company, but can't sign in and doesn't need a license |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Id |
| uid | string | Uid |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar url |
| avatar_uploaded_url | string \| null | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |
| virtual | boolean | Is user virtual |
| email_blocked | string | Email blocked timestamp |
| email_blocked_reason | string | Email blocked reason |
| delete_requested_at | string | Timestamp of delete request |
| user_id | integer | User id |
| company_id | integer | Company id |
| default_space_id | null \| integer | Default space |
| role | enum | User role in company: 1 - owner, 2 - user, 3 - deactivated |
| permissions | integer | User company permissions |
| apps_permissions | string | 0 - no access, 1 - full access to Kaiten, access to service desk denied. 2 - guest access to Kaiten, access to service desk denied. 4 - access only to service desk. 5 - full access to Kaiten and service desk. 6 - guest access to Kaiten, access to service desk |
| email_frequency | enum | 1 - never, 2 – instantly |
| email_settings | object Schema | Email settings |
| slack_id | null \|\| integer | User slack id |
| slack_settings | null \|\| object | Slack settings |
| slack_private_channel_id | null \| integer | User slack private channel id |
| telegram_sd_bot_enabled | boolean | Telegram bot enable flag |
| external | boolean | Is user external |
| notification_settings | object Schema | Notification settings |
| work_time_settings | object Schema | Work time settings |
| invite_last_sent_at | string | Last invite date |
| last_request_date | null \| string | Date of last request |
| last_request_method | null \| string | Type of last request |
| notification_enabled_channels | array | List of enabled channels for notifications |
| personal_settings | object Schema | Personal settings |
| locked | boolean | Is user locked for update |
| temporarily_inactive | boolean | Temporarily inactive: user is still in company, but can't sign in and doesn't need a license |

---

## Remove virtual user

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/users/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| id (required) | integer | User ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted user id |

---

## Create new template checklist

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{board_id}/template-checklists

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| board_id (required) | integer | Board ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| name | string | minLength: 1 maxLength: 512 | name |
| apply_type_ids | array of integers |  | policy will apply for cards with following card types |
| sort_order | number | exclusiveMinimum: 0 | Position |
| column_id | integer |  | policy will apply on specific column |
| apply_lane_ids | array of integers |  | policy will apply for cards in following lanes |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Name |
| sort_order | number | Position |
| column_id | integer | Column id |
| apply_type_ids | array | policy will apply for cards with following card types |
| apply_lane_ids | array | policy will apply for cards in following lanes |
| board_id | integer | Board id |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Template checklist id |

---

## Get list of template checklists

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{board_id}/template-checklists

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| board_id (required) | integer | Board ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Name |
| sort_order | number | Position |
| column_id | integer | Column id |
| apply_type_ids | array | policy will apply for cards with following card types |
| apply_lane_ids | array | policy will apply for cards in following lanes |
| board_id | integer | Board id |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Template checklist id |
| items | array Schema | Template checklist items |

---

## Update template checklist

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{board_id}/template-checklists/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| board_id (required) | integer | Board ID |
| id (required) | integer | Template checklist ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| name | string | minLength: 1 maxLength: 512 | name |
| apply_type_ids | array of integers |  | policy will apply for cards with following card types |
| sort_order | number | exclusiveMinimum: 0 | Position |
| board_id | integer |  | Board id |
| column_id | integer |  | Column id |
| null |  | Empty column id |
| apply_lane_ids | array of integers |  | policy will apply for cards in following lanes |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Name |
| sort_order | number | Position |
| column_id | integer | Column id |
| apply_type_ids | array | policy will apply for cards with following card types |
| apply_lane_ids | array | policy will apply for cards in following lanes |
| board_id | integer | Board id |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Template checklist id |

---

## Remove template checklist

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{board_id}/template-checklists/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| board_id (required) | integer | Board ID |
| id (required) | integer | Template checklist ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted template checklist id |

---

## Create new item

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{board_id}/template-checklists/{checklist_id}/items

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| board_id (required) | integer | Board ID |
| checklist_id (required) | integer | Template checklist ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| text (required) | string | minLength: 1 maxLength: 4096 | Content of item |
| sort_order | number | exclusiveMinimum: 0 | Position |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Template checklist item id |
| text | text | Template checklist item text |
| sort_order | number | Position |
| policy_id | integer | Template checklist id |
| user_id | integer | User id |

---

## Update item

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{board_id}/template-checklists/{checklist_id}/items/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| board_id (required) | integer | Board ID |
| checklist_id (required) | integer | Template checklist ID |
| id (required) | integer | Template checklist item ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| text | string | minLength: 1 maxLength: 4096 | Content of item |
| sort_order | number | exclusiveMinimum: 0 | Position |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Template checklist item id |
| text | text | Template checklist item text |
| sort_order | number | Position |
| policy_id | integer | Template checklist id |
| user_id | integer | User id |

---

## Remove item

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/boards/{board_id}/template-checklists/{checklist_id}/items/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| board_id (required) | integer | Board ID |
| checklist_id (required) | integer | Template checklist ID |
| id (required) | integer | Template checklist item ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted template checklist item id |

---

## Create new card

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards

### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| title (required) | number \| string |  | Title |
| board_id (required) | integer |  | Board ID |
| asap | booleandefault:false |  | ASAP marker |
| due_date | string |  | Deadline. ISO 8601 format |
| null |  | Empty due date |
| due_date_time_present | boolean |  | Flag indicating that deadline is specified up to hours and minutes |
| sort_order | number | exclusiveMinimum: 0 | Position in the cell (board_id, column_id, lane_id) |
| description | number \| string |  | Description for card |
| null |  | Empty card description |
| expires_later | boolean |  | Fixed deadline or not. Date dependant flag in terms of Kanban |
| size_text | number \| string |  | Size. Example of acceptable values: '1', '23.45', '.5', 'S', '3 M', 'L', 'XL', etc... |
| null |  | Empty size text |
| column_id | integer |  | Column ID |
| lane_id | integer |  | Lane ID |
| owner_id | integer |  | Owner ID |
| responsible_id | integer |  | Responsible ID |
| owner_email | string |  | Owner email address. Only works if email belongs to company user |
| position | enum | [1,2] | 1 - first in cell, 2 – last in cell. Overrides sort_order if present |
| type_id | integer |  | Card type ID |
| external_id | number \| string \| null |  | Any external id you want to assign to card. Not exposed in web interface |
| text_format_type_id | enum | [1,2,3] | 1 - markdown (default), 2 – html, 3 - jira wiki format |
| properties | object |  | To set custom properties when creating a card. format: 'id_{custom_property_id}: value'. value can be a null, number, string, array or object |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| archived | boolean | Card archived flag |
| id | integer | Card id |
| title | string | Card title |
| description | null \| string | Card description |
| asap | boolean | Card asap flag |
| due_date | null \| string | Card deadline |
| sort_order | number | Position |
| fifo_order | integer | Number of card in the cell when fifo rule applied to cards column |
| state | enum | 1-queued, 2-inProgresss, 3-done |
| condition | enum | 1 - live, 2 - archived |
| expires_later | boolean | Fixed deadline or not. Date dependant flag in terms of Kanban |
| parents_count | integer | Card parents count |
| children_count | integer | Card children count |
| children_done | integer | Card children done count |
| goals_total | integer | Card goals count |
| goals_done | integer | Number of card done goals |
| time_spent_sum | integer | Amount of time spent(in minutes) |
| time_blocked_sum | integer | Amount of blocked time(in minutes) |
| children_number_properties_sum | null \| object Schema | Sum according to numerical data of child cards |
| calculated_planned_start | null \| string | Calculated planned start |
| calculated_planned_end | null \| string | Calculated planned end |
| parent_checklist_ids | null \| array | Array of card parent checklist ids |
| blocking_card | boolean | Is card blocking another card |
| blocked | boolean | Is card blocked |
| size | null \| number | Numerical part of size |
| size_unit | null \| string | Text part of size |
| size_text | null \| string | Size. Example of acceptable values: '1', '23.45', '.5', 'S', '3 M', 'L', 'XL', etc... |
| due_date_time_present | boolean | Flag indicating that deadline is specified up to hours and minutes |
| board_id | integer | Board id |
| column_id | integer | Column id |
| lane_id | integer | Lane id |
| owner_id | integer | Card owner id |
| type_id | integer | Card type id |
| version | integer | Card version |
| updater_id | integer | User id who last updated card |
| completed_on_time | null \| boolean | Flag indicating that card completed on time when due date present |
| completed_at | null \| string | Date when card moved to done type column |
| last_moved_at | null \| string | Date when card last moved |
| lane_changed_at | null \| string | Date when card changed lane |
| column_changed_at | null \| string | Date when card changed column |
| first_moved_to_in_progress_at | null \| string | Date when card first moved to inProgress type column |
| last_moved_to_done_at | null \| string | Date when card last moved to done type column |
| sprint_id | integer | Sprint id |
| external_id | null \| string | External id |
| service_id | integer | Service id |
| comments_total | integer | Total card comments |
| comment_last_added_at | null \| string | Date when last comment added |
| properties | null \| object Schema | Card custom properties. Format: id_{propertyId}:value |
| planned_start | null \| string | Card timeline planned start |
| planned_end | null \| string | Card timeline planned end |
| counters_recalculated_at | string | Date of recalculating counters |
| sd_new_comment | boolean | Has unseen service desk request author comments |
| public | boolean | Is card public |
| share_settings | null \| object Schema | Public share settings |
| share_id | null \| string | Public share id |
| external_user_emails | null \| string | External users emails |
| description_filled | boolean | Flag indicating that card has description |
| estimate_workload | number | Estimate_workload |
| owner | object Schema | Card owner info |
| type | object Schema | Card type info |
| external_links | array Schema | Card external links |
| files | array Schema | Card files |
| checklists | array Schema | Card checklists |
| source | enum \| null | app, api, email, telegram, slack, webhook, import, schedule, automation |

---

## Retrieve card list

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards

### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| archived | boolean | Card archived flag |
| id | integer | Card id |
| title | string | Card title |
| description | null \| string | Card description. Present only if query parameter 'additional_card_fields' in the request contains 'description' field option |
| asap | boolean | Card asap flag |
| due_date | null \| string | Card deadline |
| sort_order | number | Position |
| fifo_order | integer | Number of card in the cell when fifo rule applied to cards column |
| state | enum | 1-queued, 2-inProgresss, 3-done |
| condition | enum | 1 - live, 2 - archived |
| expires_later | boolean | Fixed deadline or not. Date dependant flag in terms of Kanban |
| parents_count | integer | Card parents count |
| children_count | integer | Card children count |
| children_done | integer | Card children done count |
| has_blocked_children | boolean | Flag indicating that card has blocked children |
| goals_total | integer | Card goals count |
| goals_done | integer | Number of card done goals |
| time_spent_sum | integer | Amount of time spent(in minutes) |
| time_blocked_sum | integer | Amount of blocked time(in minutes) |
| children_number_properties_sum | null \| object Schema | Sum according to numerical data of child cards |
| calculated_planned_start | null \| string | Calculated planned start |
| calculated_planned_end | null \| string | Calculated planned end |
| parent_checklist_ids | null \| array | Array of card parent checklist ids |
| parents_ids | null \| array | Array of card parent ids |
| children_ids | null \| array | Array of card children ids |
| blocking_card | boolean | Is card blocking another card |
| blocked | boolean | Is card blocked |
| size | null \| number | Numerical part of size |
| size_unit | null \| string | Text part of size |
| size_text | null \| string | Size. Example of acceptable values: '1', '23.45', '.5', 'S', '3 M', 'L', 'XL', etc... |
| due_date_time_present | boolean | Flag indicating that deadline is specified up to hours and minutes |
| board_id | integer | Board id |
| column_id | integer | Column id |
| lane_id | integer | Lane id |
| owner_id | integer | Card owner id |
| type_id | integer | Card type id |
| version | integer | Card version |
| updater_id | integer | User id who last updated card |
| completed_on_time | null \| boolean | Flag indicating that card completed on time when due date present |
| completed_at | null \| string | Date when card moved to done type column |
| last_moved_at | null \| string | Date when card last moved |
| lane_changed_at | null \| string | Date when card changed lane |
| column_changed_at | null \| string | Date when card changed column |
| first_moved_to_in_progress_at | null \| string | Date when card first moved to inProgress type column |
| last_moved_to_done_at | null \| string | Date when card last moved to done type column |
| sprint_id | integer | Sprint id |
| external_id | null \| string | External id |
| service_id | integer | Service id |
| comments_total | integer | Total card comments |
| comment_last_added_at | null \| string | Date when last comment added |
| properties | null \| object Schema | Card custom properties. Format: id_{propertyId}:value |
| planned_start | null \| string | Card timeline planned start |
| planned_end | null \| string | Card timeline planned end |
| counters_recalculated_at | string | Date of recalculating counters |
| sd_new_comment | boolean | Has unseen service desk request author comments |
| public | boolean | Is card public |
| share_settings | null \| object Schema | Public share settings |
| share_id | null \| string | Public share id |
| external_user_emails | null \| string | External users emails |
| description_filled | boolean | Flag indicating that card has description |
| estimate_workload | number | Estimate_workload |
| owner | object Schema | Card owner info |
| type | object Schema | Card type info |
| board | object Schema | Card board info |
| members | array Schema | Card members |
| column | object Schema | Card column |
| lane | object Schema | Card lane info |
| children | array of objects Schema | Card childrens |
| parents | array Schema | Card parents |
| path_data | object Schema | Card path info (space, board, column, lane, etc) |
| source | enum \| null | app, api, email, telegram, slack, webhook, import, schedule, automation |

---

## Retrieve card

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| archived | boolean | Card archived flag |
| id | integer | Card id |
| title | string | Card title |
| description | null \| string | Card description |
| asap | boolean | Card asap flag |
| due_date | null \| string | Card deadline |
| sort_order | number | Position |
| fifo_order | integer | Number of card in the cell when fifo rule applied to cards column |
| state | enum | 1-queued, 2-inProgress, 3-done |
| condition | enum | 1 - live, 2 - archived |
| expires_later | boolean | Fixed deadline or not. Date dependant flag in terms of Kanban |
| parents_count | integer | Card parents count |
| children_count | integer | Card children count |
| children_done | integer | Card children done count |
| has_blocked_children | boolean | Flag indicating that card has blocked children |
| goals_total | integer | Card goals count |
| goals_done | integer | Number of card done goals |
| time_spent_sum | integer | Amount of time spent(in minutes) |
| time_blocked_sum | integer | Amount of blocked time(in minutes) |
| children_number_properties_sum | null \| object Schema | Sum according to numerical data of child cards |
| calculated_planned_start | null \| string | Calculated planned start |
| calculated_planned_end | null \| string | Calculated planned end |
| parent_checklist_ids | null \| array | Array of card parent checklist ids |
| parents_ids | null \| array | Array of card parent ids |
| children_ids | null \| array | Array of card children ids |
| blocking_card | boolean | Is card blocking another card |
| blocked | boolean | Is card blocked |
| size | null \| number | Numerical part of size |
| size_unit | null \| string | Text part of size |
| size_text | null \| string | Size. Example of acceptable values: '1', '23.45', '.5', 'S', '3 M', 'L', 'XL', etc... |
| due_date_time_present | boolean | Flag indicating that deadline is specified up to hours and minutes |
| board_id | integer | Board id |
| column_id | integer | Column id |
| lane_id | integer | Lane id |
| owner_id | integer | Card owner id |
| type_id | integer | Card type id |
| version | integer | Card version |
| updater_id | integer | User id who last updated card |
| completed_on_time | null \| boolean | Flag indicating that card completed on time when due date present |
| completed_at | null \| string | Date when card moved to done type column |
| last_moved_at | null \| string | Date when card last moved |
| lane_changed_at | null \| string | Date when card changed lane |
| column_changed_at | null \| string | Date when card changed column |
| first_moved_to_in_progress_at | null \| string | Date when card first moved to inProgress type column |
| last_moved_to_done_at | null \| string | Date when card last moved to done type column |
| sprint_id | integer | Sprint id |
| external_id | null \| string | External id |
| service_id | integer | Service id |
| comments_total | integer | Total card comments |
| comment_last_added_at | null \| string | Date when last comment added |
| properties | null \| object Schema | Card custom properties. Format: id_{propertyId}:value |
| planned_start | null \| string | Card timeline planned start |
| planned_end | null \| string | Card timeline planned end |
| counters_recalculated_at | string | Date of recalculating counters |
| sd_new_comment | boolean | Has unseen service desk request author comments |
| import_id | null \| integer | Import id |
| public | boolean | Is card public |
| share_settings | null \| object Schema | Public share settings |
| share_id | null \| string | Public share id |
| external_user_emails | null \| string | External users emails |
| description_filled | boolean | Flag indicating that card has description |
| estimate_workload | number | Estimate_workload |
| checklists | array Schema | Card checklists |
| owner | object Schema | Card owner info |
| type | object Schema | Card type info |
| board | object Schema | Card board info |
| blockers | array of objects Schema | Card blocks |
| members | array Schema | Card members |
| slas | array of objects Schema | SLAs attached to the card |
| column | object Schema | Card column |
| lane | object Schema | Card lane info |
| blocked_at | string | Date of card block |
| blocker_id | integer | User id who blocked card |
| blocker | object Schema | Info of user who blocked card |
| block_reason | string | Block reason |
| children | array of objects Schema | Card childrens |
| parents | array Schema | Card parents |
| external_links | array Schema | Card external links |
| files | array Schema | Card files |
| tags | array Schema | Card tags |
| cardRole | integer | User card role who made the request. 1-reader, 2-writer, 3-admin |
| email | string | Card email for email comment |
| source | enum \| null | app, api, email, telegram, slack, webhook, import, schedule, automation |

---

## Update card

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| title | number \| string |  | Title |
| asap | booleandefault:false |  | ASAP marker |
| due_date | string |  | Deadline. ISO 8601 format |
| null |  | Empty card description |
| due_date_time_present | boolean |  | Flag indicating that deadline is specified up to hours and minutes |
| sort_order | number | exclusiveMinimum: 0 | Position in the cell (board_id, column_id, lane_id) |
| description | number \| string |  | Description for card |
| null |  | Empty card description |
| expires_later | boolean |  | Fixed deadline or not. Date dependant flag in terms of Kanban |
| size_text | number \| string |  | Size. Example of acceptable values: '1', '23.45', '.5', 'S', '3 M', 'L', 'XL', etc... |
| null |  | Empty size text |
| board_id | integer |  | Board ID |
| column_id | integer |  | Column ID |
| lane_id | integer |  | Lane ID |
| owner_id | integer |  | Owner ID |
| type_id | integer |  | Card type ID |
| service_id | integer |  | Service ID |
| null |  | Empty service ID |
| blocked | boolean |  | Send false to release all blocks related to this card |
| condition | enum | [1,2] | 1 - live, 2 - archived, 3 - deleted |
| external_id | number \| string \| null |  | Any external id you want to assign to card. Not exposed in web interface |
| text_format_type_id | enum | [1,2,3] | 1 - markdown (default), 2 – html, 3 - jira wiki format |
| sd_new_comment | boolean |  | Has unseen Service Desk request author comments |
| owner_email | string |  | Owner email address |
| prev_card_id | integer |  | Specifies optional ID of the card that was previous one and will be positioned after the current card after repositioning |
| estimate_workload | number | minimum: 0 | Card estimate workload |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| archived | boolean | Card archived flag |
| id | integer | Card id |
| title | string | Card title |
| description | null \| string | Card description |
| asap | boolean | Card asap flag |
| due_date | null \| string | Card deadline |
| sort_order | number | Position |
| fifo_order | integer | Number of card in the cell when fifo rule applied to cards column |
| state | enum | 1-queued, 2-inProgresss, 3-done |
| condition | enum | 1 - live, 2 - archived |
| expires_later | boolean | Fixed deadline or not. Date dependant flag in terms of Kanban |
| parents_count | integer | Card parents count |
| children_count | integer | Card children count |
| children_done | integer | Card children done count |
| has_blocked_children | boolean | Flag indicating that card has blocked children |
| goals_total | integer | Card goals count |
| goals_done | integer | Number of card done goals |
| time_spent_sum | integer | Amount of time spent(in minutes) |
| time_blocked_sum | integer | Amount of blocked time(in minutes) |
| children_number_properties_sum | null \| object Schema | Sum according to numerical data of child cards |
| calculated_planned_start | null \| string | Calculated planned start |
| calculated_planned_end | null \| string | Calculated planned end |
| parent_checklist_ids | null \| array | Array of card parent checklist ids |
| parents_ids | null \| array | Array of card parent ids |
| children_ids | null \| array | Array of card children ids |
| blocking_card | boolean | Is card blocking another card |
| blocked | boolean | Is card blocked |
| size | null \| number | Numerical part of size |
| size_unit | null \| string | Text part of size |
| size_text | null \| string | Size. Example of acceptable values: '1', '23.45', '.5', 'S', '3 M', 'L', 'XL', etc... |
| due_date_time_present | boolean | Flag indicating that deadline is specified up to hours and minutes |
| board_id | integer | Board id |
| column_id | integer | Column id |
| lane_id | integer | Lane id |
| owner_id | integer | Card owner id |
| type_id | integer | Card type id |
| version | integer | Card version |
| updater_id | integer | User id who last updated card |
| completed_on_time | null \| boolean | Flag indicating that card completed on time when due date present |
| completed_at | null \| string | Date when card moved to done type column |
| last_moved_at | null \| string | Date when card last moved |
| lane_changed_at | null \| string | Date when card changed lane |
| column_changed_at | null \| string | Date when card changed column |
| first_moved_to_in_progress_at | null \| string | Date when card first moved to inProgress type column |
| last_moved_to_done_at | null \| string | Date when card last moved to done type column |
| sprint_id | integer | Sprint id |
| external_id | null \| string | External id |
| service_id | integer | Service id |
| comments_total | integer | Total card comments |
| comment_last_added_at | null \| string | Date when last comment added |
| properties | null \| object Schema | Card custom properties. Format: id_{propertyId}:value |
| planned_start | null \| string | Card timeline planned start |
| planned_end | null \| string | Card timeline planned end |
| counters_recalculated_at | string | Date of recalculating counters |
| sd_new_comment | boolean | Has unseen service desk request author comments |
| import_id | null \| integer | Import id |
| public | boolean | Is card public |
| share_settings | null \| object Schema | Public share settings |
| share_id | null \| string | Public share id |
| external_user_emails | null \| string | External users emails |
| description_filled | boolean | Flag indicating that card has description |
| estimate_workload | number | Estimate_workload |
| owner | object Schema | Card owner info |
| members | array of objects Schema | Card members |
| tags | array Schema | Card tags |
| source | enum \| null | app, api, email, telegram, slack, webhook, import, schedule, automation |

---

## Batch update for cards

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards

### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| board_id | integer |  | Сriteria board ID |
| column_id | integer |  | Criteria column ID |
| lane_id | integer |  | Criteria lane ID |
| owner_id | integer |  | Criteria owner ID |
| type_id | integer |  | Criteria card type ID |
| condition | enum | [1,2] | Criteria conditions: 1 - live, 2 - archived |
| attributes | object Schema |  | attributes to change |
| order_by | object Schema |  | Sorting parameters |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| archived | boolean | Card archived flag |
| id | integer | Card id |
| title | string | Card title |
| description | null \| string | Card description |
| asap | boolean | Card asap flag |
| due_date | null \| string | Card deadline |
| sort_order | number | Position |
| fifo_order | integer | Number of card in the cell when fifo rule applied to cards column |
| state | enum | 1-queued, 2-inProgresss, 3-done |
| condition | enum | 1 - live, 2 - archived |
| expires_later | boolean | Fixed deadline or not. Date dependant flag in terms of Kanban |
| parents_count | integer | Card parents count |
| children_count | integer | Card children count |
| children_done | integer | Card children done count |
| has_blocked_children | boolean | Flag indicating that card has blocked children |
| goals_total | integer | Card goals count |
| goals_done | integer | Number of card done goals |
| time_spent_sum | integer | Amount of time spent(in minutes) |
| time_blocked_sum | integer | Amount of blocked time(in minutes) |
| children_number_properties_sum | null \| object Schema | Sum according to numerical data of child cards |
| calculated_planned_start | null \| string | Calculated planned start |
| calculated_planned_end | null \| string | Calculated planned end |
| parent_checklist_ids | null \| array | Array of card parent checklist ids |
| parents_ids | null \| array | Array of card parent ids |
| children_ids | null \| array | Array of card children ids |
| blocking_card | boolean | Is card blocking another card |
| blocked | boolean | Is card blocked |
| size | null \| number | Numerical part of size |
| size_unit | null \| string | Text part of size |
| size_text | null \| string | Size. Example of acceptable values: '1', '23.45', '.5', 'S', '3 M', 'L', 'XL', etc... |
| due_date_time_present | boolean | Flag indicating that deadline is specified up to hours and minutes |
| board_id | integer | Board id |
| column_id | integer | Column id |
| lane_id | integer | Lane id |
| owner_id | integer | Card owner id |
| type_id | integer | Card type id |
| version | integer | Card version |
| updater_id | integer | User id who last updated card |
| completed_on_time | null \| boolean | Flag indicating that card completed on time when due date present |
| completed_at | null \| string | Date when card moved to done type column |
| last_moved_at | null \| string | Date when card last moved |
| lane_changed_at | null \| string | Date when card changed lane |
| column_changed_at | null \| string | Date when card changed column |
| first_moved_to_in_progress_at | null \| string | Date when card first moved to inProgress type column |
| last_moved_to_done_at | null \| string | Date when card last moved to done type column |
| sprint_id | integer | Sprint id |
| external_id | null \| string | External id |
| service_id | integer | Service id |
| comments_total | integer | Total card comments |
| comment_last_added_at | null \| string | Date when last comment added |
| properties | null \| object Schema | Card custom properties. Format: id_{propertyId}:value |
| planned_start | null \| string | Card timeline planned start |
| planned_end | null \| string | Card timeline planned end |
| counters_recalculated_at | string | Date of recalculating counters |
| sd_new_comment | boolean | Has unseen service desk request author comments |
| import_id | null \| integer | Import id |
| public | boolean | Is card public |
| share_settings | null \| object Schema | Public share settings |
| share_id | null \| string | Public share id |
| external_user_emails | null \| string | External users emails |
| description_filled | boolean | Flag indicating that card has description |
| estimate_workload | number | Estimate_workload |
| owner | object Schema | Card owner info |
| members | array of objects Schema | Card members |
| tags | array Schema | Card tags |
| source | enum \| null | app, api, email, telegram, slack, webhook, import, schedule, automation |

---

## Delete card

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| archived | boolean | Card archived flag |
| id | integer | Card id |
| title | string | Card title |
| description | null \| string | Card description |
| asap | boolean | Card asap flag |
| due_date | null \| string | Card deadline |
| sort_order | number | Position |
| fifo_order | integer | Number of card in the cell when fifo rule applied to cards column |
| state | enum | 1-queued, 2-inProgresss, 3-done |
| condition | enum | 3 - deleted |
| expires_later | boolean | Fixed deadline or not. Date dependant flag in terms of Kanban |
| parents_count | integer | Card parents count |
| children_count | integer | Card children count |
| children_done | integer | Card children done count |
| has_blocked_children | boolean | Flag indicating that card has blocked children |
| goals_total | integer | Card goals count |
| goals_done | integer | Number of card done goals |
| time_spent_sum | integer | Amount of time spent(in minutes) |
| time_blocked_sum | integer | Amount of blocked time(in minutes) |
| children_number_properties_sum | null \| object Schema | Sum according to numerical data of child cards |
| calculated_planned_start | null \| string | Calculated planned start |
| calculated_planned_end | null \| string | Calculated planned end |
| parent_checklist_ids | null \| array | Array of card parent checklist ids |
| parents_ids | null \| array | Array of card parent ids |
| children_ids | null \| array | Array of card children ids |
| blocking_card | boolean | Is card blocking another card |
| blocked | boolean | Is card blocked |
| size | null \| number | Numerical part of size |
| size_unit | null \| string | Text part of size |
| size_text | null \| string | Size. Example of acceptable values: '1', '23.45', '.5', 'S', '3 M', 'L', 'XL', etc... |
| due_date_time_present | boolean | Flag indicating that deadline is specified up to hours and minutes |
| board_id | integer | Board id |
| column_id | integer | Column id |
| lane_id | integer | Lane id |
| owner_id | integer | Card owner id |
| type_id | integer | Card type id |
| version | integer | Card version |
| updater_id | integer | User id who last updated card |
| completed_on_time | null \| boolean | Flag indicating that card completed on time when due date present |
| completed_at | null \| string | Date when card moved to done type column |
| last_moved_at | null \| string | Date when card last moved |
| lane_changed_at | null \| string | Date when card changed lane |
| column_changed_at | null \| string | Date when card changed column |
| first_moved_to_in_progress_at | null \| string | Date when card first moved to inProgress type column |
| last_moved_to_done_at | null \| string | Date when card last moved to done type column |
| sprint_id | integer | Sprint id |
| external_id | null \| string | External id |
| service_id | integer | Service id |
| comments_total | integer | Total card comments |
| comment_last_added_at | null \| string | Date when last comment added |
| properties | null \| object Schema | Card custom properties. Format: id_{propertyId}:value |
| planned_start | null \| string | Card timeline planned start |
| planned_end | null \| string | Card timeline planned end |
| counters_recalculated_at | string | Date of recalculating counters |
| sd_new_comment | boolean | Has unseen service desk request author comments |
| import_id | null \| integer | Import id |
| public | boolean | Is card public |
| share_settings | null \| object Schema | Public share settings |
| share_id | null \| string | Public share id |
| external_user_emails | null \| string | External users emails |
| description_filled | boolean | Flag indicating that card has description |
| estimate_workload | number | Estimate_workload |
| owner | object Schema | Card owner info |
| members | array Schema | Card members |
| source | enum \| null | app, api, email, telegram, slack, webhook, import, schedule, automation |

---

## Retrieve card location history

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/location-history

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Movement event id |
| card_id | integer | Card id |
| board_id | integer | Id of board card was moved to |
| column_id | integer | Id of column the card was moved to |
| subcolumn_id | integer \| null | Id of subcolumn the card was moved to |
| lane_id | integer | Id of lane the card was moved to |
| sprint_id | integer \| null | Sprint id |
| author_id | integer | Id of used that performed the movement/state changing action with card |
| author | object Schema | User who has moved the card, author of the action |
| condition | integer | Condition of the movement event (1 - Active, 2 - Archived, 3 - Deleted) |
| changed | string | Movement or state modification event timestamp |

---

## Retrieve card baselines

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/baselines

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Card id |
| project_id | string | Project uid |
| baseline_id | string | Baseline uid |
| planned_start | string | Baseline start time |
| planned_end | string \|\| null | Baseline end time |

---

## Block card

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/blockers

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| reason | string | minLength: 1 maxLength: 4096 | Block reason |
| blocker_card_id | integer |  | Blocker card ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Blocker id |
| reason | string | Block reason |
| card_id | integer | Blocked card id |
| blocker_id | integer | User id who blocked card |
| blocker_card_id | string | Id of blocking card |
| blocker_card_title | null \|\| string | Title of blocking card |
| released | boolean | Is block released |
| released_by_id | integer | Id of user who released block |
| due_date | null \| string | Block deadline |
| due_date_time_present | boolean | Flag indicating that deadline is specified up to hours and minutes |
| blocked_card | object Schema | Blocked card info |
| blocker | object Schema | Info of user who blocked card |
| card | object Schema | Blocking card info |

---

## Retrieve card blockers list

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/blockers

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Blocker id |
| reason | string | Block reason |
| card_id | integer | Blocked card id |
| blocker_id | integer | User id who blocked card |
| blocker_card_id | string | Id of blocking card |
| blocker_card_title | null \|\| string | Title of blocking card |
| released | boolean | Is block released |
| released_by_id | integer | Id of user who released block |
| due_date | null \| string | Block deadline |
| due_date_time_present | boolean | Flag indicating that deadline is specified up to hours and minutes |
| blocked_card | object Schema | Blocked card info |
| blocker | object Schema | Info of user who blocked card |
| card | object Schema | Blocking card info |

---

## Update card blockers

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/blockers/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| id (required) | integer | Blocker ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| reason | string | minLength: 1 maxLength: 4096 | Block reason |
| blocker_card_id | integer |  | Blocker card ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Blocker id |
| reason | string | Block reason |
| card_id | integer | Blocked card id |
| blocker_id | integer | User id who blocked card |
| blocker_card_id | string | Id of blocking card |
| blocker_card_title | null \|\| string | Title of blocking card |
| released | boolean | Is block released |
| released_by_id | integer | Id of user who released block |
| due_date | null \| string | Block deadline |
| due_date_time_present | boolean | Flag indicating that deadline is specified up to hours and minutes |

---

## Delete card blockers

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/blockers/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| id (required) | integer | Blocker ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Blocker id |
| reason | string | Block reason |
| card_id | integer | Blocked card id |
| blocker_id | integer | User id who blocked card |
| blocker_card_id | string | Id of blocking card |
| blocker_card_title | null \|\| string | Title of blocking card |
| released | boolean | Is block released |
| released_by_id | integer | Id of user who released block |
| due_date | null \| string | Block deadline |
| due_date_time_present | boolean | Flag indicating that deadline is specified up to hours and minutes |
| blocked_card | object Schema | Blocked card info |
| blocker | object Schema | Info of user who blocked card |
| card | object Schema | Blocking card info |

---

## Add blocker category

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/blockers/{blocker_id}/categories

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| blocker_id (required) | integer | Blocker id |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| name (required) | string | minLength: 1 maxLength: 128 | Block category's name |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| uid | string | Blocker identifier |
| name | string | Blocker category name |
| color | integer | Blocker category color |

---

## Retrieve list of categories

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/categories

### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| uid | string | Blocker category identifier |
| name | string | Blocker category name |
| color | integer | Blocker category color |

---

## Remove category

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/blockers/{blocker_id}/categories/{category_uuid}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| blocker_id (required) | integer | Blocker identifier |
| category_uuid (required) | string | Blocker category identifier |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| uid | string | Blocker category identifier |

---

## Add user to the card blocker

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/blockers/{blocker_id}/users

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| blocker_id (required) | integer | Blocker id |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| user_id (required) | integer |  | User id |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| uid | string | User id in uid format |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |
| virtual | boolean | Whether the user is virtual |
| email_blocked | string \| null | If blocked, email block timestamp |
| email_blocked_reason | null \| string | Reason of blocking |
| delete_requested_at | null \| string | Delete date |

---

## Retrieve list of users

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/blockers/{blocker_id}/users

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| blocker_id (required) | integer | Blocker identifier |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of bjects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |
| virtual | boolean | Whether the user is virtual |
| email_blocked | string \| null | If blocked, email block timestamp |
| email_blocked_reason | null \| string | Reason of blocking |
| delete_requested_at | null \| string | Delete date |
| show_tour | boolean | Whether to show tour to user |
| chat_enabled | boolean | Chat enabled flag |
| sd_telegram_id | null \| string | Telegram ID |
| news_subscription | boolean | News subscription status |
| uid | string | User unique identifier |
| delete_confirmation_sent_at | null \| string | Delete confirmation sent timestamp |
| eula_accepted_at | null \| string | EULA acceptance timestamp |
| terms_of_service_accepted_at | null \| string | Terms of service acceptance timestamp |
| privacy_policy_accepted_at | null \| string | Privacy policy acceptance timestamp |
| block_uid | string | Block unique identifier |
| user_uid | string | User unique identifier (duplicate) |

---

## Retrieve blockers cards list on current user

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/users/current/blockers

### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| blocked_cards | Array of objects Schema | Retrieve cards with blockers |
| summary | Object Schema |  |

---

## Remove user

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/blockers/{blocker_id}/users/{user_id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| blocker_id (required) | integer | Blocker identifier |
| user_id (required) | integer | User identifier |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User identifier |

---

## Add tag

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/tags

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| name (required) | string | minLength: 1 maxLength: 128 | Tag's name |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| archived | boolean | Archived flag |
| id | integer | Card tag id |
| name | string | Card tag name |
| company_id | integer | Company id |
| color | integer | Card tag color number |

---

## Rertrieve list of tags

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/tags

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Card tag id |
| name | string | Card tag name |
| color | integer | Card tag color number |
| card_id | integer | Card id |
| tag_id | integer | Card tag id |

---

## Remove tag from card

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/tags/{tag_id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| tag_id (required) | integer | Tag ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted card tag id |

---

## Retrieve card SLA measurements

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/sla-rules-measurements

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| calendars | array of objects Schema | Calendar objects used for SLA calculations (optional) |
| rulesTimeData | array of objects Schema | sla rules data |

---

## Add comment

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/comments

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value | Description |
| --- | --- | --- |
| Content-Type | application/json, multipart/form-data | When uploading files use multipart/form-data, otherwise any type |


### Attributes

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| text (required) | string | minLength: 0 maxLength: 4096 | Comment |
| files[] | array of binary files |  |  |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Comment id |
| uid | integer | Comment uid |
| text | string | Comment text |
| type | enum | 1-markdown, 2-html |
| edited | boolean | Is comment edited |
| card_id | integer | Card id |
| author_id | integer | Author id |
| email_addresses_to | string | Mail addresses to send comment |
| internal | boolean | Internal flag |
| deleted | boolean | Deleted flag |
| sd_external_recipients_cc | string | Service desk external recipients |
| sd_description | boolean | Flag indicating that the comment is used as a request description when the card is a service desk request |
| notification_sent | string | Notification_sent date |
| attacments | array of objects Schema | Comment attacments |

---

## Retrieve card comments

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/comments

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Comment id |
| uid | integer | Comment uid |
| text | string | Comment text |
| type | enum | 1-markdown, 2-html |
| edited | boolean | Is comment edited |
| card_id | integer | Card id |
| author_id | integer | Author id |
| email_addresses_to | string | Mail addresses to send comment |
| internal | boolean | Internal flag |
| deleted | boolean | Deleted flag |
| sd_external_recipients_cc | null \|string | Service desk external recipients |
| sd_description | boolean | Flag indicating that the comment is used as a request description when the card is a service desk request |
| notification_sent | null \| string | Notification sent date |
| author | object Schema | Author info |

---

## Update comment

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/comments/{comment_id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| comment_id (required) | integer | Comment ID |


### Headers

| Name | Value | Description |
| --- | --- | --- |
| Content-Type | application/json, multipart/form-data | When uploading files use multipart/form-data, otherwise any type |


### Attributes

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| text | string | minLength: 0 maxLength: 4096 | Comment |
| files[] | array of binary files |  |  |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Comment id |
| uid | integer | Comment uid |
| text | string | Comment text |
| type | enum | 1-markdown, 2-html |
| edited | boolean | Is comment edited |
| card_id | integer | Card id |
| author_id | integer | Author id |
| email_addresses_to | string | Mail addresses to send comment |
| internal | boolean | Internal flag |
| deleted | boolean | Deleted flag |
| sd_external_recipients_cc | string | Service desk external recipients |
| sd_description | boolean | Flag indicating that the comment is used as a request description when the card is a service desk request |
| notification_sent | string | Notification_sent date |
| attacments | array of objects Schema | Comment attacments |

---

## Remove comment

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/comments/{comment_id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| comment_id (required) | integer | Comment ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted comment id |

---

## Add external link

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/external-links

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| url (required) | string | minLength: 1 maxLength: 16384 | URL |
| description | string \| null | maxLength: 512 | Description |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| url | string | Url |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card external link id |
| description | string | Card external link description |

---

## Retrieve card external links

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/external-links

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| url | string | Url |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card external link id |
| description | string | Card external link description |
| card_id | integer | Card id |
| external_link_id | integer | Card external link id |

---

## Update external link

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/external-links/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| id (required) | integer | External link ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| url | string | minLength: 1 maxLength: 16384 | URL |
| description | string \| null | maxLength: 512 | Description |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| url | string | Url |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card external link id |
| description | string | Card external link description |

---

## Remove external link

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/external-links/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| id (required) | integer | External link ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted card external link id |

---

## Add children

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/children

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| card_id (required) | integer |  | ID of child card |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| archived | boolean | Card archived flag |
| id | integer | Children card id |
| title | string | Card title |
| description | null \| string | Card description |
| asap | boolean | Card asap flag |
| due_date | null \| string | Card deadline |
| fifo_order | integer | Number of card in the cell when fifo rule applied to cards column |
| state | enum | 1-queued, 2-inProgresss, 3-done |
| condition | enum | 1 - live, 2 - archived |
| expires_later | boolean | Fixed deadline or not. Date dependant flag in terms of Kanban |
| parents_count | integer | Card parents count |
| children_count | integer | Card children count |
| children_done | integer | Card children done count |
| goals_total | integer | Card goals count |
| goals_done | integer | Number of card done goals |
| time_spent_sum | integer | Amount of time spent(in minutes) |
| time_blocked_sum | integer | Amount of blocked time(in minutes) |
| children_number_properties_sum | null \| object Schema | Sum according to numerical data of child cards |
| parent_checklist_ids | null \| array | Array of card parent checklist ids |
| blocking_card | boolean | Is card blocking another card |
| blocked | boolean | Is card blocked |
| size | null \| number | Numerical part of size |
| size_unit | null \| string | Text part of size |
| size_text | null \| string | Size. Example of acceptable values: '1', '23.45', '.5', 'S', '3 M', 'L', 'XL', etc... |
| due_date_time_present | boolean | Flag indicating that deadline is specified up to hours and minutes |
| board_id | integer | Board id |
| column_id | integer | Column id |
| lane_id | integer | Lane id |
| owner_id | integer | Card owner id |
| type_id | integer | Card type id |
| version | integer | Card version |
| updater_id | integer | User id who last updated card |
| completed_on_time | null \| boolean | Flag indicating that card completed on time when due date present |
| completed_at | null \| string | Date when card moved to done type column |
| last_moved_at | null \| string | Date when card last moved |
| lane_changed_at | null \| string | Date when card changed lane |
| column_changed_at | null \| string | Date when card changed column |
| first_moved_to_in_progress_at | null \| string | Date when card first moved to inProgress type column |
| last_moved_to_done_at | null \| string | Date when card last moved to done type column |
| sprint_id | integer | Sprint id |
| external_id | null \| string | External id |
| service_id | integer | Service id |
| comments_total | integer | Total card comments |
| comment_last_added_at | null \| string | Date when last comment added |
| properties | null \| object Schema | Card custom properties. Format: id_{propertyId}:value |
| planned_start | null \| string | Card timeline planned start |
| planned_end | null \| string | Card timeline planned end |
| counters_recalculated_at | string | Date of recalculating counters |
| sd_new_comment | boolean | Has unseen service desk request author comments |
| public | boolean | Is card public |
| share_settings | null \| object Schema | Public share settings |
| share_id | null \| string | Public share id |
| external_user_emails | null \| string | External users emails |
| description_filled | boolean | Flag indicating that card has description |
| estimate_workload | number | Estimate_workload |
| owner | object Schema | Card owner info |
| type | object Schema | Card type info |
| has_access_to_space | boolean | Flag indicating that user who made request has aceess to space |
| path_data | object Schema | Card path info (space, board, column, lane, etc) |
| space_id | integer | Space id |

---

## Retrieve card children list

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/children

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| archived | boolean | Card archived flag |
| id | integer | Children card id |
| title | string | Card title |
| description | null \| string | Card description |
| asap | boolean | Card asap flag |
| due_date | null \| string | Card deadline |
| fifo_order | integer | Number of card in the cell when fifo rule applied to cards column |
| state | enum | 1-queued, 2-inProgresss, 3-done |
| condition | enum | 1 - live, 2 - archived |
| expires_later | boolean | Fixed deadline or not. Date dependant flag in terms of Kanban |
| parents_count | integer | Card parents count |
| children_count | integer | Card children count |
| children_done | integer | Card children done count |
| goals_total | integer | Card goals count |
| goals_done | integer | Number of card done goals |
| time_spent_sum | integer | Amount of time spent(in minutes) |
| time_blocked_sum | integer | Amount of blocked time(in minutes) |
| children_number_properties_sum | null \| object Schema | Sum according to numerical data of child cards |
| parent_checklist_ids | null \| array | Array of card parent checklist ids |
| blocking_card | boolean | Is card blocking another card |
| blocked | boolean | Is card blocked |
| size | null \| number | Numerical part of size |
| size_unit | null \| string | Text part of size |
| size_text | null \| string | Size. Example of acceptable values: '1', '23.45', '.5', 'S', '3 M', 'L', 'XL', etc... |
| due_date_time_present | boolean | Flag indicating that deadline is specified up to hours and minutes |
| board_id | integer | Board id |
| column_id | integer | Column id |
| lane_id | integer | Lane id |
| owner_id | integer | Card owner id |
| type_id | integer | Card type id |
| version | integer | Card version |
| updater_id | integer | User id who last updated card |
| completed_on_time | null \| boolean | Flag indicating that card completed on time when due date present |
| completed_at | null \| string | Date when card moved to done type column |
| last_moved_at | null \| string | Date when card last moved |
| lane_changed_at | null \| string | Date when card changed lane |
| column_changed_at | null \| string | Date when card changed column |
| first_moved_to_in_progress_at | null \| string | Date when card first moved to inProgress type column |
| last_moved_to_done_at | null \| string | Date when card last moved to done type column |
| sprint_id | integer | Sprint id |
| external_id | null \| string | External id |
| service_id | integer | Service id |
| comments_total | integer | Total card comments |
| comment_last_added_at | null \| string | Date when last comment added |
| properties | null \| object Schema | Card custom properties. Format: id_{propertyId}:value |
| planned_start | null \| string | Card timeline planned start |
| planned_end | null \| string | Card timeline planned end |
| counters_recalculated_at | string | Date of recalculating counters |
| sd_new_comment | boolean | Has unseen service desk request author comments |
| public | boolean | Is card public |
| share_settings | null \| object Schema | Public share settings |
| share_id | null \| string | Public share id |
| external_user_emails | null \| string | External users emails |
| description_filled | boolean | Flag indicating that card has description |
| estimate_workload | number | Estimate_workload |
| owner | object Schema | Card owner info |
| type | object Schema | Card type info |
| board | object Schema | Board info |
| column | object Schema | Column info |
| lane | object Schema | Lane info |
| card_id | integer | Parent card id |
| depends_on_card_id | integer | Children card id |

---

## Remove children

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/children/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| id (required) | integer | Child Card ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted card children id |

---

## Add member to card

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/members

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| user_id (required) | integer |  | User ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| type | integer | 1 - member |

---

## Retrieve list of card members

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/members

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |
| virtual | boolean | Virtual user flag |
| card_id | integer | Card id |
| user_id | integer | User id |
| type | enum | 1 - member, 2 - responsible |

---

## Update member role

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/members/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| id (required) | integer | User ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| type (required) | integer | minimum: 2 maximum: 2 | Make user responsible for card |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| card_id | integer | Card id |
| user_id | integer | User id |
| type | integer | 2 - responsible |

---

## Remove member from card

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/members/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| id (required) | integer | User ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Removed user id |

---

## Add new recipient

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/sd-external-recipients

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| email (required) | string | minLength: 1 maxLength: 128 | Recipient email |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| card_id | integer | Card id |
| user_id | null \| integer | Recipient id |
| email | string | Recipient email |
| unsubscribed | boolean | Is unsubscribed from service desk request |
| updater_id | integer | Updater id |

---

## Remove recipient

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/sd-external-recipients/{email}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| email (required) | string | Email |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| card_id | integer | Card id |
| user_id | null \| integer | Recipient id |
| email | string | Recipient email |
| unsubscribed | boolean | Is unsubscribed from service desk request |
| updater_id | integer | Updater id |
| company_id | integer | Company id |

---

## Add time log

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/time-logs

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| role_id (required) | integer |  | Role id, predefined role is: -1 - Employee |
| time_spent (required) | integer | minimum: 1 | Minutes to log |
| for_date (required) | string |  | Log date in format YYYY-MM-DD, for example 2025-12-24 |
| comment | string | maxLength: 4096 | Anything you would like to comment along with time log |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card time log id |
| card_id | integer | Card id |
| user_id | integer | User id |
| role_id | integer | Role id, predefined role is: -1 - Employee |
| author_id | integer | Author id |
| updater_id | integer | Last updater id |
| time_spent | integer | Minutes to log |
| for_date | string | Log date |
| comment | null \| string | Time log comment |

---

## Get time logs

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/time-logs

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card time log id |
| card_id | integer | Card id |
| user_id | integer | User id |
| role_id | integer | Role id, predefined role is: -1 - Employee |
| author_id | integer | Author id |
| updater_id | integer | Last updater id |
| time_spent | integer | Minutes to log |
| for_date | string | Log date |
| comment | null \| string | Time log comment |
| role | object Schema | Role info |
| user | object Schema | User info |
| author | object Schema | Author info |

---

## Update log record

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/time-logs/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| id (required) | integer | Time log ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| role_id | integer |  | Role id, predefined role is: -1 - Employee |
| time_spent | integer | minimum: 1 | Minutes to log |
| for_date | string |  | Log date in format YYYY-MM-DD, for example 2025-12-24 |
| comment | string | maxLength: 4096 | Anything you would like to comment along with time log |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card time log id |
| card_id | integer | Card id |
| user_id | integer | User id |
| role_id | integer | Role id, predefined role is: -1 - Employee |
| author_id | integer | Author id |
| updater_id | integer | Last updater id |
| time_spent | integer | Minutes to log |
| for_date | string | Log date |
| comment | null \| string | Time log comment |

---

## Remove time log

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/time-logs/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| id (required) | integer | Time log ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted time log id |

---

## Add checklist to card

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/checklists

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| name | string | minLength: 1 maxLength: 1024 | Name |
| sort_order | number | exclusiveMinimum: 0 | Position |
| items_source_checklist_id | integer | minimum: 1 | Checklist id to copy list items from |
| exclude_item_ids | array of integers |  | If source id is presented, these ids will be used to not include list items in created checklist |
| source_share_id | integer | minimum: 1 | Share checklist id |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card checklist id |
| name | string | Checklist name |
| policy_id | null \| integer | Template checklist id |
| checklist_id | string | Card checklist id |
| sort_order | number | Position |
| deleted | boolean | Flag indicating that checklist deleted |
| items | array Schema | Checklist items |

---

## Retrieve card checklist

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/checklists/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| id (required) | integer | Card CheckList ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card checklist id |
| name | string | Checklist name |
| policy_id | null \| integer | Template checklist id |
| items | array Schema | Checklist items |

---

## Update checklist

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/checklists/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| id (required) | integer | Card CheckList ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| name | string | minLength: 1 maxLength: 1024 | Name |
| sort_order | number | exclusiveMinimum: 0 | Position |
| card_id | integer |  | Move to card id |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card checklist id |
| name | string | Checklist name |
| policy_id | null \| integer | Template checklist id |

---

## Remove checklist from card

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/checklists/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| id (required) | integer | Card CheckList ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted card checklist id |

---

## Add item to checklist

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/checklists/{checklist_id}/items

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| checklist_id (required) | integer | Card CheckList ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| text (required) | string | minLength: 1 maxLength: 4096 | Content of item |
| sort_order | number | exclusiveMinimum: 0 | Position |
| checked | boolean |  | State |
| due_date | string \| null |  | Due date of checklist item in format YYYY-MM-DD, for example 2025-12-24 |
| responsible_id | integer |  | Responsible user id |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card checklist item id |
| text | string | Checklist item text |
| sort_order | number | Position |
| checked | boolean | Flag indicating that checklist item checked |
| checker_id | null \| integer | User id who checked checklist item |
| user_id | index | Current user id |
| checked_at | null \| string | Date of check |
| responsible_id | null \| integer | User id who is responsible for checklist item |
| deleted | boolean | Flag indicating that checklist item deleted |
| due_date | null \| string | checklist item deadline |

---

## Update checklist item

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/checklists/{checklist_id}/items/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| checklist_id (required) | integer | Card CheckList ID |
| id (required) | integer | Card Checklist Item ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| text | string \| null | maxLength: 4096 | Content of item |
| sort_order | number | exclusiveMinimum: 0 | Position |
| checklist_id | integer |  | ID of new checklist |
| checked | boolean |  | State |
| due_date | string \| null |  | Due date of checklist item in format YYYY-MM-DD, for example 2025-12-24 |
| responsible_id | number |  | Responsible user id |
| null |  | Remove responsible user |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card checklist item id |
| text | string | Checklist item text |
| sort_order | number | Position |
| checked | boolean | Flag indicating that checklist item checked |
| checker_id | null \| integer | User id who checked checklist item |
| user_id | index | Current user id |
| checked_at | null \| string | Date of check |
| responsible_id | null \| integer | User id who is responsible for checklist item |
| deleted | boolean | Flag indicating that checklist item deleted |
| due_date | null \| string | checklist item deadline |

---

## Remove checklist item

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/checklists/{checklist_id}/items/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| checklist_id (required) | integer | Card CheckList ID |
| id (required) | integer | Card Checklist Item ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted card checklist item |

---

## Add tag

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/tags

### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| name (required) | string | minLength: 1 maxLength: 128 | Tag's name |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Tag id |
| name | string | Tag name |
| company_id | integer | Company id |
| color | integer | Color number |
| archived | boolean | Archived flag |

---

## Retrieve list of tags

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/tags

### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Tag id |
| name | string | Tag name |
| company_id | integer | Company id |
| color | integer | Color number |
| archived | boolean | Archived flag |

---

## Create new card type

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/card-types

### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| letter (required) | string | minLength: 1 maxLength: 11 | Character that represents type. Maximum length for letters is 1 (length 11 is for emoji) |
| name (required) | string | minLength: 1 maxLength: 64 | Type name |
| color (required) | integer | minimum: 2 maximum: 25 | Color number |
| properties | object |  | Properties of the card suggested for filling - old format, deprecated, use card_properties instead |
| card_properties | array of objects Schema |  | Array of card properties that will be suggested for filling in cards of this type |
| suggest_fields | boolean |  | If true, cards of this type will be offered to display additional fields based on statistics |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| company_id | integer | Company id |
| letter | string | Card type letter |
| name | string | Card type name |
| color | integer | Color number |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card type id |
| description_template | null \| string | Card type escription_template |
| propertiesDeprecated: usecard_properties instead | null \| object Schema | Card type properties(preset and custom). Will be removed after 31.01.2026. |
| card_properties | array Schema | Array of card properties that will be suggested for filling in cards of this type |
| suggest_fields | boolean | If true, cards of this type will be offered to display additional fields based on statistics |

---

## Get list of card types

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/card-types

### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| company_id | integer | Company id |
| letter | string | Card type letter |
| name | string | Card type name |
| color | integer | Color number |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card type id |
| archived | boolean | Archived flag |
| propertiesDeprecated: usecard_properties instead | null \| object Schema | Card type properties(preset and custom). Will be removed after 31.01.2026. |
| card_properties | array Schema | Array of card properties that will be suggested for filling in cards of this type |
| suggest_fields | boolean | If true, cards of this type will be offered to display additional fields based on statistics |

---

## Get card type

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/card-types/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| id (required) | integer | Card Type ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| company_id | integer | Company id |
| letter | string | Card type letter |
| name | string | Card type name |
| color | integer | Color number |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card type id |
| description_template | null \| string | Card type escription_template |
| archived | boolean | Archived flag |
| propertiesDeprecated: usecard_properties instead | null \| object Schema | Card type properties(preset and custom). Will be removed after 31.01.2026. |
| card_properties | array Schema | Array of card properties that will be suggested for filling in cards of this type |
| suggest_fields | boolean | If true, cards of this type will be offered to display additional fields based on statistics |

---

## Update card type

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/card-types/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| id (required) | integer | Card Type ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| letter | string | minLength: 1 maxLength: 11 | Character that represents type. Maximum length for letters is 1 (length 11 is for emoji) |
| name | string | minLength: 1 maxLength: 64 | Type name |
| color | integer | minimum: 2 maximum: 25 | Color number |
| properties | object |  | Properties of the card suggested for filling - old format, deprecated, use card_properties instead |
| card_properties | array of objects Schema |  | Array of card properties that will be suggested for filling in cards of this type |
| suggest_fields | boolean |  | If true, cards of this type will be offered to display additional fields based on statistics |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| company_id | integer | Company id |
| letter | string | Card type letter |
| name | string | Card type name |
| color | integer | Color number |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card type id |
| description_template | null \| string | Card type escription_template |
| propertiesDeprecated: usecard_properties instead | null \| object Schema | Card type properties(preset and custom). Will be removed after 31.01.2026. |
| card_properties | array Schema | Array of card properties that will be suggested for filling in cards of this type |
| suggest_fields | boolean | If true, cards of this type will be offered to display additional fields based on statistics |

---

## Remove card type

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/card-types/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| id (required) | integer | Card Type ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| replace_type_id (required) | number |  | replacement id |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| company_id | integer | Company id |
| letter | string | Card type letter |
| name | string | Card type name |
| color | integer | Color number |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card type id |
| description_template | null \| string | Card type escription_template |
| propertiesDeprecated: usecard_properties instead | null \| object Schema | Card type properties(preset and custom). Will be removed after 31.01.2026. |
| card_properties | array Schema | Array of card properties that will be suggested for filling in cards of this type |
| suggest_fields | boolean | If true, cards of this type will be offered to display additional fields based on statistics |

---

## Get list

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/time-logs

### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card time log id |
| card_id | integer | Card id |
| user_id | integer | User id |
| role_id | integer | Role id, predefined role is: -1 - Employee |
| author_id | integer | Author id |
| updater_id | integer | Last updater id |
| time_spent | integer | Minutes to log |
| for_date | string | Log date |
| comment | null \| string | Time log comment |
| role | object Schema | Company user role info |
| user | object Schema | User info |
| card | object | Card info |

---

## Create new property

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/custom-properties

### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| name | string | minLength: 1 maxLength: 128 | Custom property name |
| show_on_facade | booleandefault:false |  | Should show property on card's facade |
| multiline | booleandefault:false |  | Should render multiline text field |
| vote_variant | null |  | Empty vote variant - for custom properties not of type vote and collective vote |
| enum | [rating,scale,emoji_set] | Type of vote or collective vote custom properties |
| type | enumdefault:string | [ string, number, date, email, phone, checkbox, select, formula, url, collective_score, vote, collective_vote, catalog, user, attachment ] | Validation for value by provided type |
| values_type | null |  | Empty for any type except collective value |
| enum | [number,text] | Type of values |
| colorful | boolean |  | Used for select properties. Determines should select color when creating new select value. |
| null |  | Empty colorful value |
| multi_select | boolean |  | Used for select properties. Determines is select property used as multi select |
| null |  | Empty multi select value |
| values_creatable_by_users | boolean |  | Used for select properties. Determines if users with writer role are able to create new select property values. |
| null |  | Empty values_creatable_by_users value |
| data | object Schema |  |  |
| formula | string |  | Formula for calculation |
| formula_source_card | object |  | Card data from which are used to calculate the formula |
| color | integer |  | Color of catalog custom property |
| null |  | Catalog custom property without color |
| fields_settings | object Schema |  |  |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Custom property name |
| type | string | Custom property type |
| show_on_facade | string | Should show property on card's facade |
| multiline | string | Should render multiline text field |
| fields_settings | null \| object Schema | Field settings for catalog type |
| author_id | integer | Author_id |
| company_id | integer | Company_id |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Custom property id |
| condition | string | Custom property condition |
| colorful | boolean | Used for select properties. Determines should select color when creating new select value. |
| multi_select | boolean | Used for select properties. Determines is select property used as multi select |
| values_creatable_by_users | boolean | Used for select properties. Determines if users with writer role are able to create new select property values. |
| data | null \| object | Additional custom property data |
| values_type | null \| string | Type of values |
| vote_variant | null \| string | Type of vote or collective vote custom properties |
| protected | boolean | Protected flag |
| color | null \| integer | Color of catalog custom property |
| external_id | null \| string | External id |

---

## Get list of properties

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/custom-properties

### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Custom property name |
| type | string | Custom property type |
| show_on_facade | string | Should show property on card's facade |
| multiline | string | Should render multiline text field |
| fields_settings | null \| object Schema | Field settings for catalog type |
| author_id | integer | Author_id |
| company_id | integer | Company_id |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Custom property id |
| condition | string | Custom property condition |
| colorful | boolean | Used for select properties. Determines should select color when creating new select value. |
| multi_select | boolean | Used for select properties. Determines is select property used as multi select |
| values_creatable_by_users | boolean | Used for select properties. Determines if users with writer role are able to create new select property values. |
| data | null \| object | Additional custom property data |
| values_type | null \| string | Type of values |
| vote_variant | null \| string | Type of vote or collective vote custom properties |
| protected | boolean | Protected flag |
| color | null \| integer | Color of catalog custom property |
| external_id | null \| string | External id |

---

## Get property

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/custom-properties/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| id (required) | integer | CustomProperty ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Custom property name |
| type | string | Custom property type |
| show_on_facade | string | Should show property on card's facade |
| multiline | string | Should render multiline text field |
| fields_settings | null \| object Schema | Field settings for catalog type |
| author_id | integer | Author_id |
| company_id | integer | Company_id |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Custom property id |
| condition | string | Custom property condition |
| colorful | boolean | Used for select properties. Determines should select color when creating new select value. |
| multi_select | boolean | Used for select properties. Determines is select property used as multi select |
| values_creatable_by_users | boolean | Used for select properties. Determines if users with writer role are able to create new select property values. |
| data | null \| object | Additional custom property data |
| values_type | null \| string | Type of values |
| vote_variant | null \| string | Type of vote or collective vote custom properties |
| protected | boolean | Protected flag |
| color | null \| integer | Color of catalog custom property |
| external_id | null \| string | External id |

---

## Update property

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/custom-properties/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| id (required) | integer | CustomProperty ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| name | string | minLength: 1 maxLength: 128 | Custom property name |
| show_on_facade | booleandefault:false |  | Should show property on card's facade |
| multiline | booleandefault:false |  | Should render multiline text field |
| condition | enum | [active,inactive] | Custom property condition |
| colorful | boolean |  | Used for select properties. Determines should select color when creating new select value. |
| null |  | Empty colorful value |
| multi_select | boolean |  | Used for select properties. Determines is select property used as multi select |
| null |  | Empty multi select value |
| values_creatable_by_users | boolean |  | Used for select properties. Determines if users with writer roles are able to create new select property values. |
| null |  | Empty values_creatable_by_users value |
| data | object Schema |  |  |
| color | integer |  | Color of catalog custom property |
| null |  | Catalog custom property without color |
| fields_settings | object \| null |  |  |
| is_used_as_progress | booleandefault:false |  | Whether to use this property value as a progress |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Custom property name |
| type | string | Custom property type |
| show_on_facade | string | Should show property on card's facade |
| multiline | string | Should render multiline text field |
| fields_settings | null \| object Schema | Field settings for catalog type |
| author_id | integer | Author_id |
| company_id | integer | Company_id |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Custom property id |
| condition | string | Custom property condition |
| colorful | boolean | Used for select properties. Determines should select color when creating new select value. |
| multi_select | boolean | Used for select properties. Determines is select property used as multi select |
| values_creatable_by_users | boolean | Used for select properties. Determines if users with writer role are able to create new select property values. |
| data | null \| object | Additional custom property data |
| values_type | null \| string | Type of values |
| vote_variant | null \| string | Type of vote or collective vote custom properties |
| protected | boolean | Protected flag |
| color | null \| integer | Color of catalog custom property |
| external_id | null \| string | External id |

---

## Remove property

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/custom-properties/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| id (required) | integer | CustomProperty ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Custom property name |
| type | string | Custom property type |
| show_on_facade | string | Should show property on card's facade |
| multiline | string | Should render multiline text field |
| fields_settings | null \| object Schema | Field settings for catalog type |
| author_id | integer | Author_id |
| company_id | integer | Company_id |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Custom property id |
| condition | string | Custom property condition |
| colorful | boolean | Used for select properties. Determines should select color when creating new select value. |
| multi_select | boolean | Used for select properties. Determines is select property used as multi select |
| values_creatable_by_users | boolean | Used for select properties. Determines if users with writer role are able to create new select property values. |
| data | null \| object | Additional custom property data |
| values_type | null \| string | Type of values |
| vote_variant | null \| string | Type of vote or collective vote custom properties |
| protected | boolean | Protected flag |
| color | null \| integer | Color of catalog custom property |
| external_id | null \| string | External id |

---

## Create new select value

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/custom-properties/{property_id}/select-values

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| property_id (required) | integer | CustomProperty ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| value (required) | string | minLength: 1 maxLength: 128 | Custom property select value |
| color | integer |  | Color of custom property select value |
| null |  | Custom property select value without color |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Select option id |
| custom_property_id | integer | Custom property id |
| value | string | Select option value |
| color | integer | Color number |
| author_id | integer | Author id |
| company_id | integer | Company id |
| condition | enum | Custom property select value condition |
| sort_order | number | Position |
| external_id | null \| string | External id |

---

## Get list of select values

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/custom-properties/{property_id}/select-values

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| property_id (required) | integer | CustomProperty ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Select option id |
| custom_property_id | integer | Custom property id |
| value | string | Select option value |
| color | integer | Color number |
| condition | string | Custom property select value condition |
| sort_order | number | Position |
| external_id | null \| string | External id |
| updated | string | Last update timestamp |

---

## Get select value

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/custom-properties/{property_id}/select-values/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| property_id (required) | integer | CustomProperty ID |
| id (required) | integer | Select Value ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Select option id |
| custom_property_id | integer | Custom property id |
| value | string | Select option value |
| color | integer | Color number |
| author_id | integer | Author id |
| company_id | integer | Company id |
| condition | string | Custom property select value condition |
| sort_order | number | Position |
| external_id | null \| string | External id |

---

## Update select value

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/custom-properties/{property_id}/select-values/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| property_id (required) | integer | CustomProperty ID |
| id (required) | integer | Select Value ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| value | string | minLength: 1 maxLength: 128 | Custom property select value |
| color | integer |  | Color of custom property select value |
| null |  | Custom property select value without color |
| condition | enum | [active,inactive] | Custom property select value condition |
| sort_order | number | minimum: 0 |  |
| deleted | boolean |  | Custom property select value delete condition |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Select option id |
| custom_property_id | integer | Custom property id |
| value | string | Select option value |
| color | integer | Color number |
| author_id | integer | Author id |
| company_id | integer | Company id |
| condition | string | Custom property select value condition |
| sort_order | number | Position |
| external_id | null \| string | External id |

---

## Remove property

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/custom-properties/{property_id}/select-values/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| property_id (required) | integer | CustomProperty ID |
| id (required) | integer | SelectValue ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| created | string | Create date |
| updated | string | Last update timestamp |
| id | integer | Select option id |
| custom_property_id | integer | Custom property id |
| value | string | Select option value |
| color | integer | Color number |
| author_id | integer | Author id |
| company_id | integer | Company id |
| sort_order | number | Position |
| external_id | null \| string | External id |
| condition | string | Custom property select value condition |

---

## Create new catalog value

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/custom-properties/{property_id}/catalog-values

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| property_id (required) | integer | CustomProperty ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| value (required) | object |  | contains pairs key: value, where the key is the uid of the catalog field, the value - value of this field |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Catalog option id |
| custom_property_id | integer | Custom property id |
| value | object Schema | Custom property catalog value |
| name | string | Custom property catalog value name |
| author_id | integer | Author id |
| updater_id | integer | Last updater id |
| condition | string | Custom property catalog value condition |

---

## Get list of catalog values

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/custom-properties/{property_id}/catalog-values

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| property_id (required) | integer | CustomProperty ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Catalog option id |
| custom_property_id | integer | Custom property id |
| value | object Schema | Custom property catalog value |
| name | string | Custom property catalog value name |
| author_id | integer | Author id |
| updater_id | integer | Last updater id |
| condition | string | Custom property catalog value condition |

---

## Get catalog value

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/custom-properties/{property_id}/catalog-values/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| property_id (required) | integer | CustomProperty ID |
| id (required) | integer | CatalogValue ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Catalog option id |
| custom_property_id | integer | Custom property id |
| value | object Schema | Custom property catalog value |
| name | string | Custom property catalog value name |
| author_id | integer | Author id |
| updater_id | integer | Last updater id |
| condition | string | Custom property catalog value condition |

---

## Update catalog value

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/custom-properties/{property_id}/catalog-values/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| property_id (required) | integer | CustomProperty ID |
| id (required) | integer | CatalogValue ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| condition | enum | [active,inactive] | Custom property catalog value condition |
| value | object |  | Contains pairs key: value, where the key is the uid of the catalog field, the value - value of this field |
| deleted | boolean |  | Custom property catalog value delete condition |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Catalog option id |
| custom_property_id | integer | Custom property id |
| value | object Schema | Custom property catalog value |
| name | string | Custom property catalog value name |
| author_id | integer | Author id |
| updater_id | integer | Last updater id |
| condition | string | Custom property catalog value condition |

---

## Remove property

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/custom-properties/{property_id}/catalog-values/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| property_id (required) | integer | CustomProperty ID |
| id (required) | integer | CatalogValue ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Catalog option id |
| custom_property_id | integer | Custom property id |
| value | object Schema | Custom property catalog value |
| name | string | Custom property catalog value name |
| author_id | integer | Author id |
| updater_id | integer | Last updater id |
| condition | string | Custom property catalog value condition |

---

## Create new score value

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/custom-properties/{property_id}/collective-score-values

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| property_id (required) | integer | CustomProperty ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| value (required) | string | minLength: 1 maxLength: 512 | Value of card collective score custom property |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Collective score id |
| value | string | Collective score value |
| custom_property_id | integer | Custom property id |
| author_id | integer | Author id |
| updater_id | integer | Last updater id |
| company_id | integer | Company id |
| card_id | integer | Card id |

---

## Get list of score values

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/custom-properties/{property_id}/collective-score-values

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| property_id (required) | integer | CustomProperty ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Collective score id |
| custom_property_id | integer | Custom property id |
| value | string | Collective score value |
| card_id | integer | Card id |
| author_id | integer | Author id |
| author | object | Author info |

---

## Update score value

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/custom-properties/{property_id}/collective-score-values/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| property_id (required) | integer | CustomProperty ID |
| id (required) | integer | ScoreValue ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| value | string | minLength: 1 maxLength: 512 | Value of card collective score custom property |
| null |  | Empty value |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Collective score id |
| value | string | Collective score value |
| custom_property_id | integer | Custom property id |
| author_id | integer | Author id |
| updater_id | integer | Last updater id |
| company_id | integer | Company id |
| card_id | integer | Card id |

---

## Create new vote value

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/custom-properties/{property_id}/collective-vote-values

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| property_id (required) | integer | CustomProperty ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| emoji_vote | string | minLength: 1 maxLength: 12 | Value of card collective vote of type emoji_set |
| number_vote | integer |  | Value of card collective vote of type scale or rating |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Collective score id |
| number_vote | integer | Value of card collective vote of type scale or rating |
| emoji_vote | string | Value of card collective vote of type emoji_setg |
| custom_property_id | integer | Custom property id |
| author_id | integer | Author id |
| company_id | integer | Company id |
| card_id | integer | Card id |

---

## Get list of vote values

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/custom-properties/{property_id}/collective-vote-values

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| property_id (required) | integer | CustomProperty ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Collective score id |
| custom_property_id | integer | Custom property id |
| number_vote | integer | Value of card collective vote of type scale or rating |
| emoji_vote | string | Value of card collective vote of type emoji_setg |
| card_id | integer | Card id |
| author_id | integer | Author id |
| author | object | Author info |

---

## Update vote value

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/custom-properties/{property_id}/collective-vote-values/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| property_id (required) | integer | CustomProperty ID |
| id (required) | integer | VoteValue ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| number_vote | number |  | Value of card collective vote of type scale or rating |
| null |  | Empty value of card collective vote of type scale or rating |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Collective score id |
| number_vote | integer | Value of card collective vote of type scale or rating |
| emoji_vote | string | Value of card collective vote of type emoji_setg |
| custom_property_id | integer | Custom property id |
| author_id | integer | Author id |
| company_id | integer | Company id |
| card_id | integer | Card id |

---

## Remove vote value

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/custom-properties/{property_id}/collective-vote-values/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| property_id (required) | integer | CustomProperty ID |
| id (required) | integer | VoteValue ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| emoji_vote | string | minLength: 1 maxLength: 12 | removed emoji_vote |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Collective score id |
| number_vote | integer | Value of card collective vote of type scale or rating |
| emoji_vote | string | Value of card collective vote of type emoji_setg |
| custom_property_id | integer | Custom property id |
| author_id | integer | Author id |
| company_id | integer | Company id |
| card_id | integer | Card id |

---

## Attach file to card

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/files

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | multipart/form-data |


### Attributes

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| file (required) | binary |  |  |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| card_cover | boolean | Flag indicating that image used as card cover |
| author_id | integer | Author id |
| card_id | integer | Card id |
| comment_id | integer | Comment id |
| deleted | boolean | Deleted flag |
| external | boolean | External flag |
| id | integer | File id |
| name | string | File name |
| size | integer | File size |
| sort_order | number | Position |
| type | enum | 1 - attachment, 2 - googleDrive, 3 - dropBox, 4 - box, 5 -oneDrive, 6 - yandex disc, 7 - comment email, 8 - commentAttachment |
| url | string | Uploaded url |

---

## Update file

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/files/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| id (required) | integer | File ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| card_cover | boolean |  |  |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |

---

## Detach file from card

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/files/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |
| id (required) | integer | File ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Delete file id |

---

## Retrieve services list

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/service-desk/services

### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Service id |
| name | string | Service name |
| fields_settings | null \| object Schema | Service fields |
| archived | boolean | Archived flag |
| lng | string | Language |
| email_settings | integer | Bitmap of email settings |
| type_id | null \| integer | Request (card) type ID |
| email_key | integer | Email key |
| board_id | integer | Board id |
| column_id | integer | Column id |
| lane_id | integer | Lane id |
| display_status | string | Request's status display type |
| template_description | string | Template request description |
| settings | object Schema | Service settings |
| allow_to_add_external_recipients | boolean | Allow to add external recipients |
| column | object Schema | Column info |
| board | object Schema | Board info |
| lane | object Schema | Lane info |
| voteCustomProperty | object Schema | Vote custom property info |

---

## Retrieve cards with checklist

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/checklists/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| id (required) | integer | Card CheckList ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| archived | boolean | Card archived flag |
| id | integer | Card id |
| title | string | Card title |
| description | null \| string | Card description |
| asap | boolean | Card asap flag |
| due_date | null \| string | Card deadline |
| fifo_order | integer | Number of card in the cell when fifo rule applied to cards column |
| state | enum | 1-queued, 2-inProgresss, 3-done |
| condition | enum | 1 - live, 2 - archived, 3 - deleted |
| expires_later | boolean | Fixed deadline or not. Date dependant flag in terms of Kanban |
| parents_count | integer | Card parents count |
| children_count | integer | Card children count |
| children_done | integer | Card children done count |
| goals_total | integer | Card goals count |
| goals_done | integer | Number of card done goals |
| time_spent_sum | integer | Amount of time spent(in minutes) |
| time_blocked_sum | integer | Amount of blocked time(in minutes) |
| children_number_properties_sum | null \| object | Sum according to numerical data of child cards |
| parent_checklist_ids | null \| array | Array of card parent checklist ids |
| parents_ids | null \| array | Array of card parent ids |
| children_ids | null \| array | Array of card children ids |
| blocking_card | boolean | Is card blocking another card |
| blocked | boolean | Is card blocked |
| size | null \| number | Numerical part of size |
| size_unit | null \| string | Text part of size |
| size_text | null \| string | Size. Example of acceptable values: '1', '23.45', '.5', 'S', '3 M', 'L', 'XL', etc... |
| due_date_time_present | boolean | Flag indicating that deadline is specified up to hours and minutes |
| board_id | integer | Board id |
| column_id | integer | Column id |
| lane_id | integer | Lane id |
| owner_id | integer | Card owner id |
| type_id | integer | Card type id |
| version | integer | Card version |
| updater_id | integer | User id who last updated card |
| completed_on_time | null \| boolean | Flag indicating that card completed on time when due date present |
| completed_at | null \| string | Date when card moved to done type column |
| last_moved_at | null \| string | Date when card last moved |
| lane_changed_at | null \| string | Date when card changed lane |
| column_changed_at | null \| string | Date when card changed column |
| first_moved_to_in_progress_at | null \| string | Date when card first moved to inProgress type column |
| last_moved_to_done_at | null \| string | Date when card last moved to done type column |
| sprint_id | integer | Sprint id |
| external_id | null \| string | External id |
| service_id | integer | Service id |
| comments_total | integer | Total card comments |
| comment_last_added_at | null \| string | Date when last comment added |
| properties | null \| object | Card custom properties. Format: id_{propertyId}:value |
| planned_start | null \| string | Card timeline planned start |
| planned_end | null \| string | Card timeline planned end |
| counters_recalculated_at | string | Date of recalculating counters |
| sd_new_comment | boolean | Has unseen service desk request author comments |
| import_id | null \| integer | Import id |
| public | boolean | Is card public |
| share_settings | null \| object Schema | Public share settings |
| share_id | null \| string | Public share id |
| external_user_emails | null \| string | External users emails |
| description_filled | boolean | Flag indicating that card has description |
| tags_ids | array | Array of card tags ids |
| has_access_to_space | boolean | Flag indicating that user who made request has aceess to space |
| path_data | object Schema | Card path info (space, board, column, lane, etc) |
| space_id | integer | Space id |

---

## Add item to checklist

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/checklists/{checklist_id}/items

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| checklist_id (required) | integer | Card CheckList ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| text (required) | string | minLength: 1 maxLength: 4096 | Content of item |
| sort_order | number | exclusiveMinimum: 0 | Position |
| checked | boolean |  | State |
| due_date | string \| null |  | Due date of checklist item in format YYYY-MM-DD, for example 2025-12-24 |
| responsible_id | integer |  | Responsible user id |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card checklist item id |
| text | string | Checklist item text |
| sort_order | number | Position |
| checked | boolean | Flag indicating that checklist item checked |
| checker_id | null \| integer | User id who checked checklist item |
| user_id | index | Current user id |
| checked_at | null \| string | Date of check |
| responsible_id | null \| integer | User id who is responsible for checklist item |
| deleted | boolean | Flag indicating that checklist item deleted |
| due_date | null \| string | checklist item deadline |

---

## Update checklist item

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/checklists/{checklist_id}/items/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| checklist_id (required) | integer | Card CheckList ID |
| id (required) | integer | Checklist Item ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| text | string \| null | maxLength: 4096 | Content of item |
| sort_order | number | exclusiveMinimum: 0 | Position |
| checklist_id | integer |  | ID of new checklist |
| checked | boolean |  | State |
| due_date | string \| null |  | Due date of checklist item in format YYYY-MM-DD, for example 2025-12-24 |
| responsible_id | number |  | Responsible user id |
| null |  | Remove responsible user |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Card checklist item id |
| text | string | Checklist item text |
| sort_order | number | Position |
| checked | boolean | Flag indicating that checklist item checked |
| checker_id | null \| integer | User id who checked checklist item |
| user_id | integer | Current user id |
| checked_at | null \| string | Date of check |
| responsible_id | null \| integer | User id who is responsible for checklist item |
| deleted | boolean | Flag indicating that checklist item deleted |
| due_date | null \| string | checklist item deadline |

---

## Remove checklist item

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/checklists/{checklist_id}/items/{id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| checklist_id (required) | integer | Card CheckList ID |
| id (required) | integer | Checklist Item ID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | Deleted card checklist item |

---

## Retrieve users list

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/cards/{card_id}/allowed-users

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| card_id (required) | integer | Card ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |

---

## Create automation

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}/automations

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Automation types and attributes

| Automation type | Attributes | Description |
| --- | --- | --- |
| Event automation | Schema | Automation that triggered by events. Example: When card created on the board N - add tags |
| Date automation | Schema | Automation that triggered by date. Example: When 2 days left before card due dates - add sla |
| Button automation | Schema | Automation which are triggered manually. Through a button "Automation" in the card interface |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string \| null | AutomationName |
| sort_order | number | Automation sort order |
| space_uid | string | Space uid |
| updater_id | integer | User id, who created automation |
| company_id | integer | Company id |
| created | string | Created timestamp |
| updated | string | Updated timestamp |
| id | string | Automation uid |
| status | enum | active, disabled, removed, broken |
| type | enum | on_action - event automatation, on_date - due date automation |
| trigger | object Schema | Automation trigger data |
| actions | array of objects Schema | Automation actions |
| conditions | object Schema | Automation conditions |

---

## Get list of automations

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}/automations

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string \| null | AutomationName |
| sort_order | number | Automation sort order |
| space_uid | string | Space uid |
| updater_id | integer | User id, who created automation |
| company_id | integer | Company id |
| created | string | Created timestamp |
| updated | string | Updated timestamp |
| id | string | Automation uid |
| status | enum | active, disabled, removed, broken |
| type | enum | on_action - event automatation, on_date - due date automation |
| trigger | object Schema | Automation trigger data |
| actions | array of objects Schema | Automation actions |
| conditions | object Schema | Automation conditions |

---

## Update automation

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}/automations/{automation_uid}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |
| automation_uid (required) | string | Automation UID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Automation types and attributes

| Automation type | Attributes | Description |
| --- | --- | --- |
| Event automation | Schema | Automation that triggered by events. Example: When card created on the board N - add tags |
| Date automation | Schema | Automation that triggered by date. Example: When 2 days left before card due dates - add sla |
| Button automation | Schema | Automation which are triggered manually. Through a button "Automation" in the card interface |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string \| null | AutomationName |
| sort_order | number | Automation sort order |
| space_uid | string | Space uid |
| updater_id | integer | User id, who created automation |
| company_id | integer | Company id |
| created | string | Created timestamp |
| updated | string | Updated timestamp |
| id | string | Automation uid |
| status | enum | active, disabled, removed, broken |
| type | enum | on_action - event automatation, on_date - due date automation |
| trigger | object Schema | Automation trigger data |
| actions | array of objects Schema | Automation actions |
| conditions | object Schema | Automation conditions |

---

## Delete automation

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_id}/automations/{automation_uid}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_id (required) | integer | Space ID |
| automation_uid (required) | string | Automation UID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success |  | Response body does not exist |

---

## Create group

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/groups

### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| name (required) | string | minLength: 1 maxLength: 512 | Group name |
| permissions | integer |  | Group permissions |
| add_to_cards_and_spaces_enabled | boolean |  | Should add cards and spaces |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Group name |
| permissions | integer | Group permissions |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Group id |
| uid | string | Group uid |
| add_to_cards_and_spaces_enabled | boolean | Ability to add all users of the group to cards, placed in group spaces. Ability to filter logs by group in «Timesheets» |

---

## Get list of groups

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/groups

### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Group name |
| permissions | integer | Group permissions |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Group id |
| uid | string | Group uid |
| add_to_cards_and_spaces_enabled | boolean | Ability to add all users of the group to cards, placed in group spaces. Ability to filter logs by group in «Timesheets» |

---

## Get group

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/groups/{uid}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| uid (required) | string | Group Uid |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Group name |
| permissions | integer | Group permissions |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Group id |
| uid | string | Group uid |
| add_to_cards_and_spaces_enabled | boolean | Ability to add all users of the group to cards, placed in group spaces. Ability to filter logs by group in «Timesheets» |

---

## Update group

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/groups/{uid}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| uid (required) | string | Group Uid |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| name | string | minLength: 1 maxLength: 512 | Group name |
| permissions | integer |  | Group permissions(bit mask) |
| add_to_cards_and_spaces_enabled | boolean |  | Ability to add all users of the group to cards, placed in group spaces. Ability to filter logs by group in «Timesheets» |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Group name |
| permissions | integer | Group permissions |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Group id |
| uid | string | Group uid |
| add_to_cards_and_spaces_enabled | boolean | Ability to add all users of the group to cards, placed in group spaces. Ability to filter logs by group in «Timesheets» |

---

## Remove Group

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/groups/{uid}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| uid (required) | string | Group Uid |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| name | string | Group name |
| permissions | integer | Group permissions |
| updated | string | Last update timestamp |
| created | string | Create date |
| id | integer | Group id |
| uid | string | Group uid |
| add_to_cards_and_spaces_enabled | boolean | Ability to add all users of the group to cards, placed in group spaces. Ability to filter logs by group in «Timesheets» |

---

## Add user to group

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/groups/{group_uid}/users

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| group_uid (required) | string | Group Uid |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| user_id (required) | integer |  | User Id |
| request_id | string |  | Request id if addition to the group is answer for access request |
| operator_comment | string | minLength: 1 maxLength: 1024 | Operator's comment if addition to the group is answer for access request |
| null |  |  |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |
| virtual | boolean | Is user virtual |
| email_blocked | null \| string | Email blocked timestamp |
| email_blocked_reason | null \| string | Email blocked reason |
| delete_requested_at | null \| string | Timestamp of delete request |

---

## Get list of group users

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/groups/{group_uid}/users

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| group_uid (required) | string | Group Uid |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |
| virtual | boolean | Is user virtual |
| email_blocked | null \| string | Email blocked timestamp |
| email_blocked_reason | null \| string | Email blocked reason |
| delete_requested_at | null \| string | Timestamp of delete request |
| delete_confirmation_sent_at | null \| string | Timestamp of sending confirmation of deletion |
| sd_telegram_id | integer | Service desk telegram id |
| news_subscription | boolean | news subscription flag |

---

## Remove user from group

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/groups/{group_uid}/users/{user_id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| group_uid (required) | string | Group Uid |
| user_id (required) | integer | User ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |
| virtual | boolean | Is user virtual |
| email_blocked | null \| string | Email blocked timestamp |
| email_blocked_reason | null \| string | Email blocked reason |
| delete_requested_at | null \| string | Timestamp of delete request |

---

## Add admin to group

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/groups/{group_uid}/admins

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| group_uid (required) | string | Group Uid |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| user_id (required) | integer |  | User Id |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |
| virtual | boolean | Is user virtual |
| email_blocked | null \| string | Email blocked timestamp |
| email_blocked_reason | null \| string | Email blocked reason |
| delete_requested_at | null \| string | Timestamp of delete request |

---

## Get list of group admins

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/groups/{group_uid}/admins

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| group_uid (required) | string | Group Uid |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |
| virtual | boolean | Is user virtual |
| email_blocked | null \| string | Email blocked timestamp |
| email_blocked_reason | null \| string | Email blocked reason |
| delete_requested_at | null \| string | Timestamp of delete request |
| delete_confirmation_sent_at | null \| string | Timestamp of sending confirmation of deletion |
| sd_telegram_id | integer | Service desk telegram id |
| news_subscription | boolean | news subscription flag |

---

## Remove admin from group

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/groups/{group_uid}/admins/{user_id}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| group_uid (required) | string | Group Uid |
| user_id (required) | integer | User ID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | integer | User id |
| full_name | string | User full name |
| email | string | User email |
| username | string | Username for mentions and login |
| avatar_initials_url | string | Default user avatar |
| avatar_uploaded_url | null \| string | User uploaded avatar url |
| initials | string | User initials |
| avatar_type | enum | 1 – gravatar, 2 – initials, 3 - uploaded |
| lng | string | Language |
| timezone | string | Time zone |
| theme | enum | light - light color theme, dark - dark color theme, auto - color theme based on OS settings |
| updated | string | Last update timestamp |
| created | string | Create date |
| activated | boolean | User activated flag |
| ui_version | enum | 1 - old ui. 2 - new ui |
| virtual | boolean | Is user virtual |
| email_blocked | null \| string | Email blocked timestamp |
| email_blocked_reason | null \| string | Email blocked reason |
| delete_requested_at | null \| string | Timestamp of delete request |

---

## Add entity

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/groups/{group_uid}/entities

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| group_uid (required) | string | Group Uid |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| entity_uid (required) | string |  | Entity_uid |
| role_ids (required) | array of strings |  | Roles for these entity in the group |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| group_id | integer | Group id |
| entity_uid | string | Entity uid |
| access_mod | string \| null | Access modifier with inheritable access modifiers |
| own_access_mod | string\| null | Own access modifier |
| role_ids | array of strings | Entity roles ids with inherited roles |
| own_role_ids | array of strings | Entity role ids |
| role_permissions | object Schema | Group entity permissions |

---

## Get list of group entities

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/groups/{group_uid}/entities

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| group_uid (required) | string | Group Uid |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| uid | string | Entity uid |
| path | string | Inner path to entity |
| title | string | Entity title |
| own_role_ids | array of strings | Entity roles ids |
| entity_type | string | Entity type. "space" - Space, "document" - Document "document_group" - Folder "story_map" - Story map |

---

## Update group entity

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/groups/{group_uid}/entities/{uid}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| group_uid (required) | string | Group Uid |
| uid (required) | string | Entity Uid |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| role_ids | array of strings |  | Entity roles for this group |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| group_id | integer | Group id |
| entity_uid | string | Entity uid |
| access_mod | string \| null | Access modifier with inheritable access modifiers |
| own_access_mod | string\| null | Own access modifier |
| role_ids | array of strings | Entity roles ids with inherited roles |
| own_role_ids | array of strings | Entity roles ids |
| role_permissions | object Schema | Group entity permissions |

---

## Remove entity

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/company/groups/{group_uid}/entities/{uid}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| group_uid (required) | string | Group Uid |
| uid (required) | string | Entity Uid |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| group_id | integer | Group id |
| entity_uid | string | Entity uid |
| access_mod | string \| null | Access modifier with inheritable access modifiers |
| own_access_mod | string\| null | Own access modifier |
| role_ids | array of strings | Entity roles ids with inherited roles |
| own_role_ids | array of strings\| null | Entity roles ids |
| role_permissions | null | Group entity permissions |

---

## Get list of tree entity roles

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/tree-entity-roles

### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| id | string | Role uid |
| created | string | Create date |
| updated | string | Last update timestamp |
| name | string | Role name |
| sort_order | number | Role sort order |
| new_permissions_default_value | boolean | When changing the permissions structure, grant rights to new actions by default |
| role_permissions | object Schema | Group entity permissions |

---

## Get list of entities

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/tree-entities

### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| uid | string | Entity uid |
| title | string | Entity title |
| sort_order | number | Entity sort order |
| archived | boolean | Archived flag |
| access | string | Entity access |
| for_everyone_access_role_id | string | Role id for when access is for_everyone |
| entity_type | string | Entity type |
| path | string | Inner path to entity |
| parent_entity_uid | string | Parent entity uid |

---

## Create new space template checklist

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_uid}/template-checklists

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_uid (required) | string | Space UID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| name | string | minLength: 1 maxLength: 512 | Template checklist name |
| sort_order | number | exclusiveMinimum: 0 | Position |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| uid | string | Template checklist UID |
| name | string | Name |
| sort_order | number | Position |
| space_uid | string | Space UID |
| created | string | Create timestamp |
| updated | string | Last update timestamp |

---

## Get list of space template checklists

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_uid}/template-checklists

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_uid (required) | string | Space UID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Array of objects | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| uid | string | Template checklist UID |
| name | string | Name |
| sort_order | number | Position |
| space_uid | string | Space UID |
| created | string | Create timestamp |
| updated | string | Last update timestamp |
| items | array Schema | Template checklist items |

---

## Update space template checklist

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_uid}/template-checklists/{template_checklist_uid}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_uid (required) | string | Space UID |
| template_checklist_uid (required) | string | Template checklist UID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| name | string | minLength: 1 maxLength: 512 | Template checklist name |
| sort_order | number | exclusiveMinimum: 0 | Position |
| space_uid | string |  |  |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| uid | string | Template checklist UID |
| name | string | Name |
| sort_order | number | Position |
| space_uid | string | Space UID |
| created | string | Create timestamp |
| updated | string | Last update timestamp |

---

## Remove space template checklist

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_uid}/template-checklists/{template_checklist_uid}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_uid (required) | string | Space UID |
| template_checklist_uid (required) | string | Template checklist UID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| uid | string | Deleted template checklist UID |

---

## Create new space template checklist item

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_uid}/template-checklists/{template_checklist_uid}/items

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_uid (required) | string | Space UID |
| template_checklist_uid (required) | string | Template checklist UID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| text (required) | string | minLength: 1 maxLength: 4096 | Content of the checklist item |
| sort_order | number | exclusiveMinimum: 0 | Position |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| uid | string | Item UID |
| text | string | Text |
| sort_order | number | Position |
| user_id | number | Author ID |
| created | string | Create timestamp |
| updated | string | Last update timestamp |

---

## Update space template checklist item

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_uid}/template-checklists/{template_checklist_uid}/items/{item_uid}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_uid (required) | string | Space UID |
| template_checklist_uid (required) | string | Template checklist UID |
| item_uid (required) | string | Template checklist item UID |


### Headers

| Name | Value |
| --- | --- |
| Content-Type | application/json |


### Attributes

_schema_

| Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| text | string | minLength: 1 maxLength: 4096 | Content of the checklist item |
| sort_order | number | exclusiveMinimum: 0 | Position |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| uid | string | Item UID |
| text | string | Text |
| sort_order | number | Position |
| user_id | number | Author ID |
| created | string | Create timestamp |
| updated | string | Last update timestamp |

---

## Remove space template checklist item

**Method:** POST
**URL:** https://example.kaiten.ru/api/latest/spaces/{space_uid}/template-checklists/{template_checklist_uid}/items/{item_uid}

### Path parameters

| Name | Type | Reference |
| --- | --- | --- |
| space_uid (required) | string | Space UID |
| template_checklist_uid (required) | string | Template checklist UID |
| item_uid (required) | string | Template checklist item UID |


### Responses

| Description | Response type | Example |
| --- | --- | --- |
| Success | Object | Open |


### Response Attributes

| Name | Type | Description |
| --- | --- | --- |
| uid | string | Deleted template checklist item uid |
