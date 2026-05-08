# Test Coverage Reference

Each section maps to a source file. Functions appear in source-declaration order.
Within each function, tests are listed in the order they appear in the test file.

---

## `lib/api/sfApi.js` ← `tests/lib/api/sfApi.test.js`

### Module initialisation
| Test | Verifies |
|------|----------|
| `module load > calls checkRequiredEnvVariables when sfApi is required` | Env-var check runs at require-time |

### `authorizeFirm`
| Test | Verifies |
|------|----------|
| `authorizeFirm > delegates to SilverfinAuthorizer.authorizeFirm` | Delegates to SilverfinAuthorizer |

### `refreshFirmTokens`
| Test | Verifies |
|------|----------|
| `refreshFirmTokens > delegates to SilverfinAuthorizer.refreshFirm and returns result` | Returns refreshed tokens |

### `refreshPartnerToken`
| Test | Verifies |
|------|----------|
| `refreshPartnerToken > delegates to SilverfinAuthorizer.refreshPartner and returns result` | Returns refreshed partner token |

### `createReconciliationText`
| Test | Verifies |
|------|----------|
| `createReconciliationText > POSTs to reconciliations and calls responseSuccessHandler` | POST succeeds and handler is called |
| `createReconciliationText > returns the full response on success` | Full response object returned |
| `createReconciliationText > calls responseErrorHandler on HTTP error` | Error handler invoked on failure |

### `readReconciliationTexts`
| Test | Verifies |
|------|----------|
| `readReconciliationTexts > GETs reconciliations with page and per_page params` | Pagination params sent |
| `readReconciliationTexts > defaults to page 1` | Page 1 used when omitted |
| `readReconciliationTexts > returns response.data (not the full response)` | Only data property returned |

### `readReconciliationTextById`
| Test | Verifies |
|------|----------|
| `readReconciliationTextById > GETs reconciliations/{id} and returns full response` | Full response from single-record endpoint |

### `updateReconciliationText`
| Test | Verifies |
|------|----------|
| `updateReconciliationText > POSTs to reconciliations/{id}` | Correct endpoint called |

### `findReconciliationTextByHandle`
| Test | Verifies |
|------|----------|
| `findReconciliationTextByHandle > returns null when the page is empty` | Null on empty results |
| `findReconciliationTextByHandle > skips templates with marketplace_template_id set` | Marketplace templates ignored |
| `findReconciliationTextByHandle > skips templates without text field (hidden code)` | Hidden-code templates ignored |
| `findReconciliationTextByHandle > returns the matching non-marketplace template` | Match found and returned |
| `findReconciliationTextByHandle > paginates when handle not found on the current page` | Fetches next page on miss |

### `readSharedParts`
| Test | Verifies |
|------|----------|
| `readSharedParts > GETs shared_parts with page and per_page params` | Pagination params sent |
| `readSharedParts > returns the full response object (not just .data)` | Full response returned (asymmetry with readReconciliationTexts) |

### `findSharedPartByName`
| Test | Verifies |
|------|----------|
| `findSharedPartByName > returns null when the page is empty` | Null on empty results |
| `findSharedPartByName > returns the matching shared part` | Match found and returned |
| `findSharedPartByName > paginates when name not found on the current page` | Fetches next page on miss |

### `createSharedPart`
| Test | Verifies |
|------|----------|
| `createSharedPart > POSTs to shared_parts` | Correct endpoint called |

### `updateSharedPart`
| Test | Verifies |
|------|----------|
| `updateSharedPart > POSTs to shared_parts/{id}` | Correct endpoint called |

### `addSharedPartToReconciliation`
| Test | Verifies |
|------|----------|
| `addSharedPartToReconciliation > POSTs to reconciliations/{recId}/shared_parts/{spId}` | Correct nested endpoint called |

### `removeSharedPartFromReconciliation`
| Test | Verifies |
|------|----------|
| `removeSharedPartFromReconciliation > DELETEs reconciliations/{recId}/shared_parts/{spId}` | DELETE to correct endpoint |

### `readExportFiles`
| Test | Verifies |
|------|----------|
| `readExportFiles > GETs export_files with page and per_page and returns response.data` | Data array returned |

### `findExportFileByName`
| Test | Verifies |
|------|----------|
| `findExportFileByName > returns null when page is empty` | Null on empty results |
| `findExportFileByName > makes a second GET call (readExportFileById) after finding name match` | Extra GET for full record after name match |

### `createExportFile`
| Test | Verifies |
|------|----------|
| `createExportFile > POSTs to export_files` | Correct endpoint called |

### `updateExportFile`
| Test | Verifies |
|------|----------|
| `updateExportFile > POSTs to export_files/{id}` | Correct endpoint called |

### `readAccountTemplates`
| Test | Verifies |
|------|----------|
| `readAccountTemplates > GETs account_templates and returns response.data` | Data array returned |

### `findAccountTemplateByName`
| Test | Verifies |
|------|----------|
| `findAccountTemplateByName > returns null when page is empty` | Null on empty results |
| `findAccountTemplateByName > makes a second GET for the full record after name match` | Extra GET for full record after name match |

### `createAccountTemplate`
| Test | Verifies |
|------|----------|
| `createAccountTemplate > POSTs to account_templates` | Correct endpoint called |

### `updateAccountTemplate`
| Test | Verifies |
|------|----------|
| `updateAccountTemplate > POSTs to account_templates/{id}` | Correct endpoint called |

### `createTestRun`
| Test | Verifies |
|------|----------|
| `createTestRun > POSTs to reconciliations/test for reconciliationText type` | Correct endpoint for reconciliation type |
| `createTestRun > POSTs to account_templates/test for accountTemplate type` | Correct endpoint for account template type |
| `createTestRun > calls consola.error and process.exit() for unknown templateType` | Unknown type triggers error + exit |

### `createPreviewRun`
| Test | Verifies |
|------|----------|
| `createPreviewRun > POSTs to reconciliations/render for reconciliationText type` | Correct render endpoint |
| `createPreviewRun > POSTs to account_templates/render for accountTemplate type` | Correct render endpoint |

### `readTestRun`
| Test | Verifies |
|------|----------|
| `readTestRun > GETs reconciliations/test_runs/{id} for reconciliationText` | Correct polling endpoint |
| `readTestRun > GETs account_templates/test_runs/{id} for accountTemplate` | Correct polling endpoint |

### `getPeriods`
| Test | Verifies |
|------|----------|
| `getPeriods > GETs /companies/{cId}/periods with pagination params` | Pagination params included |

### `findPeriod`
| Test | Verifies |
|------|----------|
| `findPeriod > returns the matching period from the array` | Correct period returned |
| `findPeriod > returns undefined when the period id is not found` | Undefined on no match |

### `getAllPeriodCustom`
| Test | Verifies |
|------|----------|
| `getAllPeriodCustom > accumulates items across pages until an empty page is returned` | All pages collected |
| `getAllPeriodCustom > stops at MAX_PAGES (50) and logs a warning` | Hard limit respected |
| `getAllPeriodCustom > handles null/undefined response gracefully` | Returns empty array on bad response |

### `findReconciliationInWorkflows`
| Test | Verifies |
|------|----------|
| `findReconciliationInWorkflows > returns undefined and logs warning when not found` | Undefined + warning on miss |
| `findReconciliationInWorkflows > returns the reconciliation when found` | Match returned |

### `verifyLiquid`
| Test | Verifies |
|------|----------|
| `verifyLiquid > POSTs to reconciliations/verify_liquid with JSON Content-Type header` | JSON Content-Type header set |

### `getFirmDetails`
| Test | Verifies |
|------|----------|
| `getFirmDetails > GETs /user/firm and returns response.data` | Firm data returned |

### `createExportFileInstance`
| Test | Verifies |
|------|----------|
| `createExportFileInstance > POSTs to /companies/{cId}/periods/{pId}/export_file_instances` | Correct nested endpoint with export_file_id |

### `getExportFileInstance`
| Test | Verifies |
|------|----------|
| `getExportFileInstance > GETs /companies/{cId}/periods/{pId}/export_file_instances/{id}` | Correct GET endpoint |

### Error handling (shared across endpoints)
| Test | Verifies |
|------|----------|
| `error handling > [endpoint] calls responseErrorHandler on network error` | All endpoints delegate to responseErrorHandler |

---

## `lib/api/axiosFactory.js` ← `tests/lib/api/axiosFactory.test.js`

### `AxiosFactory.createInstance` (invalid type)
| Test | Verifies |
|------|----------|
| `Create Instance > should throw an error for invalid type` | Unknown type throws |

### `AxiosFactory.createInstance` (firm)
| Test | Verifies |
|------|----------|
| `Firm instance > should create a valid instance` | Firm instance created successfully |
| `Firm instance > should throw an error for missing tokens and terminate process` | Missing tokens cause exit |
| `Firm instance > should refresh tokens on 401 Unauthorized error` | 401 triggers token refresh and retry |
| `Firm instance > should attempt to refresh tokens only once on 401 and terminate` | Single refresh attempt before exit |
| `Firm instance > should throw any other response errors` | Non-401 errors re-thrown |
| `Firm instance > should throw the error again if there is no response` | Network errors re-thrown |

### `AxiosFactory.createInstance` (partner)
| Test | Verifies |
|------|----------|
| `Partner instance > should create a valid instance` | Partner instance created successfully |
| `Partner instance > should add partner_id and api_key to request params` | Auth params injected |
| `Partner instance > should throw an error for missing API key and terminate process` | Missing key causes exit |
| `Partner instance > should refresh API key on 401 Unauthorized error` | 401 triggers key refresh and retry |
| `Partner instance > should attempt to refresh API key only once on 401 and terminate` | Single refresh attempt before exit |
| `Partner instance > should throw any other response error` | Non-401 errors re-thrown |
| `Partner instance > should throw the error again if there is no response` | Network errors re-thrown |

### `AxiosFactory.createInstance` (staging)
| Test | Verifies |
|------|----------|
| `Staging environment > should raise an error if environment variable is not set` | Missing staging env var throws |
| `Staging environment > should use basic auth for firm instance in staging` | Basic auth applied in staging |
| `Staging environment > should use basic auth for partner instance in staging` | Basic auth applied in staging |

### `AxiosFactory.createAuthInstance`
| Test | Verifies |
|------|----------|
| `Create auth instance for firm > should not throw an error for missing tokens` | Auth instance tolerates missing tokens |
| `Create auth instance for firm > should not attempt to refresh tokens` | No refresh interceptor on auth instance |
| `Create auth instance for firm > should use basic auth for firm instance in staging` | Staging basic auth applied |

---

## `lib/api/firmCredentials.js` ← `tests/lib/api/firmCredentials.test.js`

### `constructor` / initialisation
| Test | Verifies |
|------|----------|
| `initialization > creates the .silverfin directory if it does not exist` | Directory created on first run |
| `initialization > does not create the .silverfin directory if it already exists` | Existing directory left alone |
| `initialization > creates the credentials file if it does not exist` | Credentials file created |
| `initialization > loads existing credentials if the file exists` | Existing file loaded |
| `initialization > adds default values if they are missing from existing credentials` | Missing defaults backfilled |

### `loadCredentials`
| Test | Verifies |
|------|----------|
| `loadCredentials > loads credentials from file successfully` | File parsed and returned |

### `saveCredentials`
| Test | Verifies |
|------|----------|
| `saveCredentials > writes credentials to file successfully` | File written with current state |
| `saveCredentials > handles file system error when saving credentials` | FS errors handled gracefully |

### `setHost` / `getHost`
| Test | Verifies |
|------|----------|
| `setHost and getHost > should set and get the host correctly` | Round-trip set/get works |
| `setHost and getHost > should return environment variable host if set` | Env var takes precedence |
| `setHost and getHost > should return default host if not set` | Falls back to default |

---

## `lib/api/silverfinAuthorizer.js` ← `tests/lib/api/silverfinAuthorizer.test.js`

### `authorizeFirm`
| Test | Verifies |
|------|----------|
| `authorizeFirm > should successfully store new tokens when they don't exist` | New tokens stored |
| `authorizeFirm > should successfully store new tokens when they exist` | Existing tokens overwritten |
| `authorizeFirm > should raise an error when firm id is missing` | Missing firm id throws |
| `authorizeFirm > should handle response errors` | API errors surfaced |
| `authorizeFirm > should not raise errors when getting the firm name fails` | Firm-name failure non-fatal |

### `refreshFirm`
| Test | Verifies |
|------|----------|
| `refreshFirm > should store provided tokens` | Refreshed tokens persisted |
| `refreshFirm > should raise an error when there are no previous tokens` | No prior tokens throws |
| `refreshFirm > should handle response errors` | API errors surfaced |

### `refreshPartner`
| Test | Verifies |
|------|----------|
| `refreshPartner > should store the new API key` | New key persisted |
| `refreshPartner > should raise an error when there are no previous tokens` | No prior tokens throws |
| `refreshPartner > should handle response errors` | API errors surfaced |

---

## `lib/utils/apiUtils.js` ← `tests/lib/utils/apiUtils.test.js`

### `checkRequiredEnvVariables`
| Test | Verifies |
|------|----------|
| `checkRequiredEnvVariables > does not exit when both vars are set` | Passes when both present |
| `checkRequiredEnvVariables > exits with 1 and logs SF_API_CLIENT_ID when missing` | Exit(1) on missing client id |
| `checkRequiredEnvVariables > exits with 1 and logs SF_API_SECRET when missing` | Exit(1) on missing secret |
| `checkRequiredEnvVariables > exits with 1 and lists both when both are missing` | Both missing reported together |

### `responseSuccessHandler`
| Test | Verifies |
|------|----------|
| `responseSuccessHandler > calls consola.debug with status, method and url from response.config` | Debug log from config object |
| `responseSuccessHandler > falls back to response.method and response.url when config is absent` | Direct properties used as fallback |
| `responseSuccessHandler > does not call consola.debug when response has no status` | Skips log when status absent |
| `responseSuccessHandler > does not throw when called with null` | Null input handled safely |

### `responseErrorHandler`
| Test | Verifies |
|------|----------|
| `responseErrorHandler > always logs the debug line with status, method and url` | Debug info logged for all errors |
| `responseErrorHandler > calls consola.error and returns undefined for 404` | 404 → log + undefined |
| `responseErrorHandler > calls consola.error and returns undefined for 400` | 400 → log + undefined |
| `responseErrorHandler > calls consola.error and process.exit(1) for 422` | 422 → log + exit(1) |
| `responseErrorHandler > calls consola.debug for 401 and falls through to throw` | 401 logged then rethrown |
| `responseErrorHandler > calls consola.error and process.exit(1) for 403` | 403 → log + exit(1) |
| `responseErrorHandler > rethrows when there is no response (network error)` | Network errors rethrown |

### `checkAuthorizePartners`
| Test | Verifies |
|------|----------|
| `checkAuthorizePartners > returns the result of firmCredentials.getPartnerCredentials` | Delegates to firmCredentials |
| `checkAuthorizePartners > returns undefined when partner has no credentials` | Undefined for unknown partner |

---

## `lib/utils/templateUtils.js` ← `tests/lib/utils/templateUtils.test.js`

### `TEMPLATES_NAME_ATTRIBUTE` (constant)
| Test | Verifies |
|------|----------|
| `TEMPLATES_NAME_ATTRIBUTE > maps reconciliationText to handle` | reconciliationText → handle |
| `TEMPLATES_NAME_ATTRIBUTE > maps accountTemplate to name_nl` | accountTemplate → name_nl |
| `TEMPLATES_NAME_ATTRIBUTE > maps exportFile to name_nl` | exportFile → name_nl |
| `TEMPLATES_NAME_ATTRIBUTE > maps sharedPart to name` | sharedPart → name |

### `TEMPLATE_MAP_TYPES` (constant)
| Test | Verifies |
|------|----------|
| `TEMPLATE_MAP_TYPES > maps legacy 'reconciliation'` | reconciliation → reconciliationText |
| `TEMPLATE_MAP_TYPES > maps legacy 'reconciliation_text'` | reconciliation_text → reconciliationText |
| `TEMPLATE_MAP_TYPES > maps legacy 'account_detail_template'` | account_detail_template → accountTemplate |
| `TEMPLATE_MAP_TYPES > maps 'account_template'` | account_template → accountTemplate |
| `TEMPLATE_MAP_TYPES > maps 'shared_part'` | shared_part → sharedPart |
| `TEMPLATE_MAP_TYPES > maps 'export_file'` | export_file → exportFile |

### `TEMPLATE_TYPE_NAMES` (constant)
| Test | Verifies |
|------|----------|
| `TEMPLATE_TYPE_NAMES > has a human-readable name for each template type` | All types have display names |

### `getTemplateName`
| Test | Verifies |
|------|----------|
| `getTemplateName > returns handle for reconciliationText` | handle property returned |
| `getTemplateName > returns name_nl for accountTemplate` | name_nl property returned |
| `getTemplateName > returns name_nl for exportFile` | name_nl property returned |
| `getTemplateName > returns name for sharedPart` | name property returned |

### `checkValidName`
| Test | Verifies |
|------|----------|
| `checkValidName > [multiple parameterised cases]` | Names validated per template-type rules (alphanumeric+underscore for reconciliation; no slashes/backslashes for account/export) |

### `filterParts`
| Test | Verifies |
|------|----------|
| `filterParts > reduces text_parts array to a {name: content} object` | Array converted to keyed object |
| `filterParts > returns an empty object for an empty array` | Empty input → empty object |

### `missingLiquidCode`
| Test | Verifies |
|------|----------|
| `missingLiquidCode > returns true when template.text is undefined` | Undefined text detected |
| `missingLiquidCode > returns true when template.text is null` | Null text detected |
| `missingLiquidCode > returns true when template.text is empty string` | Empty string detected |
| `missingLiquidCode > returns false when template.text is present` | Valid text passes |
| `missingLiquidCode > includes the handle in the warning message when available` | Handle shown in warning |

### `missingNameNL`
| Test | Verifies |
|------|----------|
| `missingNameNL > returns true when name_nl is missing` | Absent name_nl detected |
| `missingNameNL > returns true when name_nl is an empty string` | Empty string detected |
| `missingNameNL > returns false when name_nl is present` | Valid name passes |
| `missingNameNL > includes fallback name (name_en) in the warning` | name_en used as fallback |
| `missingNameNL > falls back to name_fr in the warning when name_en is also missing` | name_fr used when name_en missing |

---

## `lib/utils/errorUtils.js` ← `tests/lib/utils/errorUtils.test.js`

### `uncaughtErrors`
| Test | Verifies |
|------|----------|
| `uncaughtErrors > calls console.error with GitHub issues link and version info when error has a stack` | Stack + link logged |
| `uncaughtErrors > calls consola.error with the error message` | Error message logged |
| `uncaughtErrors > calls process.exit(1)` | Always exits with code 1 |
| `uncaughtErrors > does not call console.error with stack content when error.stack is falsy` | Stack skipped when absent |

### `errorHandler`
| Test | Verifies |
|------|----------|
| `errorHandler > calls consola.error with the path for ENOENT errors` | File-not-found shows path |
| `errorHandler > calls uncaughtErrors for non-ENOENT errors` | Other errors delegated to uncaughtErrors |

### `missingConfig`
| Test | Verifies |
|------|----------|
| `missingConfig > logs an error containing the identifier and exits with 1` | Error logged + exit(1) |

### `missingReconciliationId`
| Test | Verifies |
|------|----------|
| `missingReconciliationId > logs an error containing the handle` | Handle shown in error |
| `missingReconciliationId > logs a hint command containing the handle` | Import-hint command shown |
| `missingReconciliationId > returns false` | Always returns false |

### `missingSharedPartId`
| Test | Verifies |
|------|----------|
| `missingSharedPartId > logs an error containing the name` | Name shown in error |
| `missingSharedPartId > returns false` | Always returns false |

### `missingExportFileId`
| Test | Verifies |
|------|----------|
| `missingExportFileId > logs an error containing the name` | Name shown in error |
| `missingExportFileId > returns false` | Always returns false |

### `missingAccountTemplateId`
| Test | Verifies |
|------|----------|
| `missingAccountTemplateId > logs an error containing the name` | Name shown in error |
| `missingAccountTemplateId > returns false` | Always returns false |

---

## `lib/utils/runTestUtils.js` ← `tests/lib/utils/runTestUtils.test.js`

### `checkRenderMode`
| Test | Verifies |
|------|----------|
| `checkRenderMode > (false, false) returns "none"` | Both false → "none" |
| `checkRenderMode > (true, false) returns "input"` | Only htmlInput → "input" |
| `checkRenderMode > (false, true) returns "preview"` | Only htmlPreview → "preview" |
| `checkRenderMode > (true, true) returns "all"` | Both true → "all" |

---

## `lib/utils/urlHandler.js` ← `tests/lib/utils/urlHandler.test.js`

### `UrlHandler` constructor
| Test | Verifies |
|------|----------|
| `constructor > should create instance with valid url` | url property set |
| `constructor > should create instance with url and custom filename` | customFilename stored |
| `constructor > should throw error when url is undefined/null/empty/omitted` | Invalid url throws |

### `UrlHandler.openFile` — download and open
| Test | Verifies |
|------|----------|
| `openFile > should download file with Content-Disposition filename and open it` | Content-Disposition name used |
| `openFile > should download file with custom filename and inferred extension` | Custom filename with extension |
| `openFile > should use timestamp filename when Content-Disposition is missing` | Timestamp fallback |
| `openFile > should use .html extension when Content-Disposition is missing` | Default .html extension |

### `UrlHandler.openFile` — Content-Disposition parsing
| Test | Verifies |
|------|----------|
| `openFile > should parse filename from standard Content-Disposition format` | Quoted filename extracted |
| `openFile > should parse filename from UTF-8 encoded Content-Disposition` | UTF-8 encoding decoded |
| `openFile > should parse filename without quotes` | Unquoted name extracted |
| `openFile > should parse filename with special characters` | Special chars preserved |
| `openFile > should extract correct extension from Content-Disposition` | Extension extracted correctly |

### `UrlHandler.openFile` — unique filename generation
| Test | Verifies |
|------|----------|
| `openFile > should generate unique filename when file already exists` | "(1)" suffix added |
| `openFile > should increment counter for multiple existing files` | Counter increments correctly |
| `openFile > should preserve extension when generating unique filename` | Extension kept in unique name |

### `UrlHandler.openFile` — platform open
| Test | Verifies |
|------|----------|
| `openFile > should open file using open package when not in WSL` | Non-WSL uses `open` |
| `openFile > should open file using WSLHandler when in WSL` | WSL uses WSLHandler |

### `UrlHandler.openFile` — error handling
| Test | Verifies |
|------|----------|
| `openFile > should log error when axios download fails` | Download failure logged |
| `openFile > should log error when file opening fails in non-WSL` | Open failure logged |
| `openFile > should log error when WSLHandler.open fails` | WSL open failure logged |
| `openFile > should handle ENOENT error from errorHandler` | File-not-found handled |
| `openFile > should handle fs.mkdirSync failure gracefully` | Dir-creation failure handled |
| `openFile > should handle fs.writeFileSync failure gracefully` | Write failure handled |

### `UrlHandler.openFile` — edge cases
| Test | Verifies |
|------|----------|
| `openFile > should handle very long filenames` | Long names do not crash |
| `openFile > should handle binary file data correctly` | Binary content preserved |
| `openFile > should handle empty file content` | Zero-byte file handled |
| `openFile > should use correct temp directory path` | Temp dir path correct |
| `openFile > should handle URLs with query parameters` | Query strings ignored in naming |
| `openFile > should handle Content-Disposition with multiple parameters` | Multi-param header parsed |

---

## `lib/utils/wslHandler.js` ← `tests/lib/utils/wslHandler.test.js`

### `isWSL`
| Test | Verifies |
|------|----------|
| `isWSL > returns true when /proc/version contains 'microsoft'` | "microsoft" string detected |
| `isWSL > returns true when /proc/version contains 'wsl'` | "wsl" string detected |
| `isWSL > returns false when /proc/version contains neither` | Non-WSL returns false |
| `isWSL > returns false when reading /proc/version throws` | Read error → false |

### `open`
| Test | Verifies |
|------|----------|
| `open > calls execFile with wsl-open when it is in PATH` | wsl-open invoked |
| `open > calls consola.error when execFile fails` | Execution failure logged |
| `open > prompts for installation when wsl-open is not in PATH and warns when user declines` | Decline warned, not installed |
| `open > installs wsl-open when user confirms with 'y'` | Install runs on confirmation |

---

## `lib/utils/liquidTestUtils.js` ← `tests/lib/utils/liquidTestUtils.test.js`

### `processCustom`
| Test | Verifies |
|------|----------|
| `processCustom > should sort by namespace first` | Namespaces sorted alphabetically |
| `processCustom > should sort by key within the same namespace` | Keys sorted within namespace |
| `processCustom > should handle numeric suffixes correctly` | Numeric suffix natural-sort |
| `processCustom > should handle mixed keys (with and without numeric suffixes)` | Mixed alphanumeric sort |
| `processCustom > should handle values with field property` | field property extracted |
| `processCustom > should handle regular values without field property` | Raw value used |
| `processCustom > should handle mixed value types` | Both value shapes handled |
| `processCustom > should handle complex multi-namespace sorting` | Full sorting matrix |
| `processCustom > should handle empty array` | Empty input → empty object |
| `processCustom > should handle single item` | Single item processed |
| `processCustom > should handle numeric suffixes beyond 10` | Sort stable past index 10 |

---

## `lib/utils/fsUtils.js` — `checkLiquidTestDependencies` ← `tests/lib/utils/checkLiquidTestDependencies.test.js`

### `checkLiquidTestDependencies`
| Test | Verifies |
|------|----------|
| `should return empty array when no templates depend on the target handle` | No dependencies → empty |
| `should find templates that reference target handle in data subtree as string values` | String value match found |
| `should find templates that reference target handle in data subtree as keys` | Key name match found |
| `should only scan data subtree, not context or expectation` | Non-data sections ignored |
| `should handle nested structures in data` | Nested objects scanned |
| `should handle arrays in data` | Arrays scanned |
| `should only check templates with liquid test files` | Templates without tests skipped |
| `should handle multiple test cases` | All test cases checked |
| `should return unique handles even if target appears multiple times` | Results deduplicated |
| `should not include the target handle itself` | Self-reference excluded |
| `should handle parsing errors gracefully` | YAML errors continue scan |

---

## `lib/utils/fsUtils.js` — `findTemplatesWithLiquidTests` ← `tests/lib/utils/findTemplatesWithLiquidTests.test.js`

### `findTemplatesWithLiquidTests`
| Test | Verifies |
|------|----------|
| `should return empty array when reconciliation_texts directory does not exist` | Missing dir → empty |
| `should return empty array when no test files exist` | No tests → empty |
| `should find templates with liquid test files` | Handles with tests returned |
| `should exclude variant files with TY suffix` | TY variants excluded |
| `should exclude variant files with other uppercase suffix patterns` | Other uppercase suffixes excluded |
| `should only search in reconciliation_texts, not account_templates` | Scope limited to reconciliation_texts |
| `should skip directories without tests folder` | No tests folder → skip |
| `should skip non-directory files in reconciliation_texts` | Non-directories ignored |
| `should handle multiple templates with mixed main and variant files` | Main files found, variants skipped |

---

## `lib/templates/reconciliationText.js` ← `tests/lib/templates/reconciliationTexts.test.js`

### `ReconciliationText.save`
| Test | Verifies |
|------|----------|
| `save > should return false if the template handle is missing` | No handle → false |
| `save > should return false if the liquid code is missing` | No liquid → false |
| `save > should return false if the template handle is invalid` | Invalid handle → false |
| `save > should create the necessary files and store template's relevant details` | main.liquid, text_parts, test file, config.json all created |
| `save > should fetch an existing template's config and update with new details` | Existing config merged with new firm ID |
| `save > should replace existing liquid files if the template already exists` | Liquid overwritten on re-import |
| `save > should not replace existing liquid test files if the template already exists` | Test YAML preserved |
| `save > should not replace or delete unspecified text_parts` | Unrelated parts preserved |
| `save > should save template with all locale names` | All name_* properties written |
| `save > should preserve existing locale names when saving template` | Existing locale names kept |

### `ReconciliationText.read`
| Test | Verifies |
|------|----------|
| `read > should return false if the template handle is invalid` | Invalid handle → false |
| `read > should read and process the template correctly` | Config + liquid + text_parts assembled |
| `read > should create main.liquid if it doesn't exist` | Missing main.liquid auto-created |
| `read > should create liquid test file if it's missing` | Missing test file auto-created |
| `read > should warn and remove invalid reconciliation_type` | Invalid type stripped with warning |
| `read > should add missing handle and names to config` | Missing fields inferred |
| `read > should handle templates with no text parts` | Empty text_parts → [] |
| `read > should handle empty text parts` | Empty part file → empty content |
| `read > should exclude downloadable_as_docx when externally_managed is false` | Invalid combination guarded |
| `read > should include downloadable_as_docx when externally_managed is true` | Valid combination allowed |
| `read > should handle templates with custom locale names` | All locale names read |
| `read > should add missing locale names with handle as fallback` | Handle used as fallback locale |

---

## `lib/templates/accountTemplate.js` ← `tests/lib/templates/accountTemplates.test.js`

### `AccountTemplate.save`
| Test | Verifies |
|------|----------|
| `save > should return false if name_nl is missing` | No name_nl → false |
| `save > should return false if the liquid code is missing` | No liquid → false |
| `save > should return false if the template handle is invalid` | Invalid name → false |
| `save > should create the necessary files and store template's relevant details` | All files and config created |
| `save > should fetch an existing template's config and update with new details` | Existing config merged |
| `save > should replace existing liquid files if the template already exists` | Liquid overwritten on re-import |
| `save > should not replace existing liquid test files if the template already exists` | Test YAML preserved |
| `save > should not replace or delete unspecified text_parts` | Unrelated parts preserved |
| `save > should not overwrite existing YAML test files when importing` | YAML content preserved |

### `AccountTemplate.read`
| Test | Verifies |
|------|----------|
| `read > should read and process the account template correctly` | Config + liquid + text_parts assembled |
| `read > should create liquid test file if it's missing` | Missing test file auto-created |

---

## `lib/templates/exportFile.js` ← `tests/lib/templates/exportFiles.test.js`

### `ExportFile.save`
| Test | Verifies |
|------|----------|
| `save > should return false if the template name_nl is missing` | No name_nl → false |
| `save > should return false if there is no liquid code` | No liquid → false |
| `save > should return false if the template name_nl is invalid` | Invalid name → false |
| `save > should create the necessary files and store template's relevant details` | main.liquid, text_parts, config.json all created |
| `save > should fetch an existing template's config and update with new details` | Existing config merged |
| `save > should not replace or delete unspecified text_parts` | Unrelated parts preserved |

---

## `lib/templates/sharedPart.js` ← `tests/lib/templates/sharedParts.test.js`

### `SharedPart.save`
| Test | Verifies |
|------|----------|
| `save > should return false if the template name is invalid` | Invalid name → false |
| `save > should create the necessary files and store template's relevant details` | Liquid file and config.json created |
| `save > should save with partner type (uses partner_id key in config)` | Partner saves under partner_id |
| `save > should merge with existing config.json when file already exists` | Existing config IDs preserved |
| `save > should preserve existing firm IDs when saving for a different firm` | Multi-firm IDs kept |
| `save > should write used_in entries from API response` | used_in array written |
| `save > should skip used_in entries with legacy numeric id` | Legacy numeric ids filtered |

### `SharedPart.read`
| Test | Verifies |
|------|----------|
| `read > should create the liquid file if it doesn't exist` | Missing file auto-created |
| `read > should return false when name is invalid` | Invalid name → false |
| `read > should read config.json and return only CONFIG_ITEMS keys` | Only whitelisted keys returned |

### `SharedPart.updateTemplateId`
| Test | Verifies |
|------|----------|
| `updateTemplateId > should read existing config, set id for given type/envId, and write back` | ID written for correct type and envId |

---

## `lib/index.js` (toolkit) ← `tests/lib/toolkit.test.js`

### `publishReconciliationById`
| Test | Verifies |
|------|----------|
| `should successfully update reconciliation by ID when matching template found` | Template found and API updated |
| `should return false when no template found with matching ID` | Missing template → false |
| `should handle partner type correctly` | Partner ID path used for partner type |
| `should return false when template reading fails` | Read failure → false |
| `should return false when API call fails` | API failure → false |
| `should handle exceptions gracefully` | Exceptions delegated to errorHandler |
| `should use default message when none provided` | Default version comment applied |

### `publishExportFileById`
| Test | Verifies |
|------|----------|
| `should successfully update export file by ID when matching template found` | Template found and API updated |
| `should return false when no template found with matching ID` | Missing template → false |
| `should return false when template reading fails` | Read failure → false |
| `should return false when API call fails` | API failure → false |
| `should handle exceptions gracefully` | Exceptions delegated to errorHandler |
| `should use default message when none provided` | Default version comment applied |

### `publishAccountTemplateById`
| Test | Verifies |
|------|----------|
| `should successfully update account template by ID when matching template found` | Template found and API updated |
| `should return false when no template found with matching ID` | Missing template → false |
| `should handle partner type correctly` | Partner ID path used for partner type |
| `should return false when template reading fails` | Read failure → false |
| `should return false when API call fails` | API failure → false |
| `should handle exceptions gracefully` | Exceptions delegated to errorHandler |
| `should use default message when none provided` | Default version comment applied |

### `publishSharedPartById`
| Test | Verifies |
|------|----------|
| `should successfully update shared part by ID when matching template found` | Template found and API updated |
| `should return false when no template found with matching ID` | Missing template → false |
| `should return false when template reading fails` | Read failure → false |
| `should return false when API call fails` | API failure → false |
| `should handle exceptions gracefully` | Exceptions delegated to errorHandler |
| `should use default message when none provided` | Default version comment applied |

---

## `lib/liquidTestRunner.js` ← `tests/lib/liquidTestRunner.test.js`

### `checkAllTestsErrorsPresent`
| Test | Verifies |
|------|----------|
| `returns false when reconciled is null and results/rollforwards are empty` | All-passing tests → false |
| `returns true when reconciled is non-null` | reconciled error detected |
| `returns true when results has keys` | results error detected |
| `returns true when rollforwards has keys` | rollforwards error detected |
| `stops checking after finding the first error` | Short-circuits on first failure |
| `returns false for multiple passing tests` | All-pass across many tests |

### `runTests`
| Test | Verifies |
|------|----------|
| `calls process.exit for invalid templateType` | Unknown type exits |
| `returns undefined when config is not found` | Missing config → undefined |
| `returns undefined when test YAML file is not found` | Missing YAML → undefined |
| `creates a test run and returns results` | Full API test run cycle |
| `includes shared parts in template content when they exist` | Shared part liquid injected |

### `runTestsWithOutput`
| Test | Verifies |
|------|----------|
| `logs ALL TESTS HAVE PASSED when completed with no errors` | Pass message shown |
| `logs test_error message when status is test_error` | Test error surfaced |
| `logs internal_error message when status is internal_error` | Internal error surfaced |
| `logs failure details for failed tests` | Per-test failure details printed |
| `logs SUCCESSFULLY RENDERED HTML when previewOnly=true with no errors` | Preview success shown |

### `runTestsStatusOnly`
| Test | Verifies |
|------|----------|
| `calls process.exit for invalid templateType` | Unknown type exits |
| `returns PASSED when all handles pass` | Aggregate pass result |
| `returns FAILED when any handle fails` | Aggregate fail result |

### `getHTML`
| Test | Verifies |
|------|----------|
| `does not call UrlHandler when openBrowser is false` | Browser not opened when flag false |
| `calls UrlHandler.openFile with the url when openBrowser is true` | Browser opened with correct URL |

---

## `lib/liquidTestGenerator.js` ← `tests/lib/liquidTestGenerator.test.js`

### `testGenerator` — template reading
| Test | Verifies |
|------|----------|
| `should read reconciliation template correctly` | Reconciliation liquid loaded |
| `should handle missing reconciliation template gracefully` | Missing template exits with warning |
| `should read shared parts correctly` | Shared part liquid included |
| `should handle missing shared part gracefully` | Missing part warned, skipped |

### `testGenerator` — period custom data
| Test | Verifies |
|------|----------|
| `should process period custom data correctly` | Custom data fetched and structured |
| `should handle empty period custom data` | Empty custom data handled |

### `testGenerator` — error handling
| Test | Verifies |
|------|----------|
| `should exit with error code 1 for authorization failures` | Auth failure → exit(1) |
| `should warn and exit for missing reconciliation template` | Missing template → exit |
| `should warn and return gracefully for missing shared parts` | Missing part → continue |

### `testGenerator` — period data
| Test | Verifies |
|------|----------|
| `should set current period correctly` | Current period context built |
| `should handle previous period correctly` | Prior period included in context |

### `testGenerator` — account template generation
| Test | Verifies |
|------|----------|
| `should read account template correctly` | Account template liquid loaded |
| `should set current_account in context` | Account range context set |
| `should fetch account template custom and results` | Custom data + results fetched |
| `should use starred status from account response` | Starred flag propagated |
| `should skip dependency resolution for account templates` | No shared-part injection |
| `should handle missing account template association gracefully` | Missing association skipped |
| `should handle missing account template file gracefully` | Missing file exits gracefully |
| `should handle account lookup errors gracefully` | Lookup error caught |
| `should process period custom data for account templates` | Custom data included |
| `should handle empty period custom data for account templates` | Empty custom data handled |

---

## `lib/exportFileInstanceGenerator.js` ← `tests/lib/exportFileInstanceGenerator.test.js`

### `ExportFileInstanceGenerator` constructor
| Test | Verifies |
|------|----------|
| `throws when firmId is missing` | Missing firmId throws |
| `throws when companyId is missing` | Missing companyId throws |
| `throws when periodId is missing` | Missing periodId throws |
| `throws when exportFileId is missing` | Missing exportFileId throws |
| `constructs successfully with all required parameters` | Valid params → instance created |

### `ExportFileInstanceGenerator.generateAndOpenFile`
| Test | Verifies |
|------|----------|
| `calls SF.createExportFileInstance with the correct parameters` | API called with right params |
| `returns undefined when createExportFileInstance returns falsy` | Falsy response → early exit |
| `returns undefined when createExportFileInstance returns object without id` | Missing id → early exit |
| `stops polling and returns response when state is created` | Created state resolves |
| `stops polling and returns false when state is unexpected` | Unexpected state → false |
| `polls multiple times while state is pending and increments attempts` | Pending state retried |
| `returns false after MAX_ATTEMPTS (25) without resolution` | Attempt limit respected |
| `calls consola.warn when validation_errors are present` | Validation errors warned |
| `calls UrlHandler.openFile with content_url when state is created` | File opened on success |
| `calls consola.error when state is created but content_url is missing` | Missing URL logged |
| `calls errorUtils.errorHandler when an exception is thrown` | Exceptions delegated |

---

## `lib/cli/utils.js` ← `tests/lib/cli/utils.test.js`

### `loadDefaultFirmId`
| Test | Verifies |
|------|----------|
| `returns stored default firm id from firmCredentials` | Stored ID returned |
| `falls back to SF_FIRM_ID env variable when no stored config` | Env var fallback |
| `prefers firmCredentials over SF_FIRM_ID env var` | Config takes precedence |
| `returns undefined when neither source has a value` | No ID → undefined |

### `checkDefaultFirm`
| Test | Verifies |
|------|----------|
| `calls consola.info when firmUsed equals firmIdDefault` | Info shown for default firm |
| `does not call consola.info when firmUsed differs from firmIdDefault` | No info for non-default |

### `formatOption`
| Test | Verifies |
|------|----------|
| `converts camelCase to kebab-case` | camelCase → kebab-case |
| `converts single uppercase letter correctly` | Single cap converted |
| `returns lowercase words unchanged` | All-lowercase left as-is |
| `handles multiple uppercase letters` | Multiple caps handled |

### `checkUniqueOption`
| Test | Verifies |
|------|----------|
| `calls process.exit when none of the unique options are present` | No unique option → exit |
| `calls process.exit when more than one unique option is present` | Multiple unique options → exit |
| `returns true when exactly one unique option is used` | Exactly one → true |
| `includes formatted flag names in the error message` | Flag names in error |

### `checkRequiredFirmOrPartner`
| Test | Verifies |
|------|----------|
| `calls process.exit when a required option is used without firm or partner` | Missing firm/partner → exit |
| `returns true when firm is provided with a required option` | firm present → true |
| `returns true when partner is provided with a required option` | partner present → true |
| `mentions partner in error message when partnerSupported=true` | Partner in error when supported |
| `does not mention partner in error message when partnerSupported=false` | Partner absent from error |

### `getCommandSettings`
| Test | Verifies |
|------|----------|
| `returns type=firm and envId=options.firm when no partner` | Firm settings returned |
| `returns type=partner and envId=options.partner when partner is present` | Partner settings returned |

### `runCommandChecks`
| Test | Verifies |
|------|----------|
| `calls process.exit when partner used without --message and messageRequired=true` | Missing message → exit |
| `does not exit for partner with --message when messageRequired=true` | Message present → continues |
| `calls promptConfirmation when options.yes is falsy and skipConfirmation is false` | Confirmation prompted |
| `skips promptConfirmation when skipConfirmation=true` | Skip flag respected |
| `skips promptConfirmation when options.yes is truthy` | --yes flag respected |
| `calls checkDefaultFirm when type is firm` | Default firm check done |
| `returns the command settings object` | Settings object returned |

### `logCurrentHost`
| Test | Verifies |
|------|----------|
| `does not log when host is the default SF host` | Default host silent |
| `logs current host info when host is a non-default value` | Non-default host logged |

### `checkPartnerSupport`
| Test | Verifies |
|------|----------|
| `calls process.exit when both --partner and --all are set` | Conflicting flags → exit |
| `does not exit when only --partner is set` | Partner alone allowed |
| `does not exit when only --all is set` | All alone allowed |

---

## `lib/cli/stats.js` ← `tests/lib/cli/stats.test.js`

### `saveOverviewToFile`
| Test | Verifies |
|------|----------|
| `creates ./stats/ directory if it does not exist` | Directory auto-created |
| `creates overview.csv with column headers on first run` | Header row written |
| `appends a new data row on each call` | Row appended on repeat calls |
| `row contains semicolon-separated values` | CSV format correct |

### `percentageRoundTwo` (via CSV output)
| Test | Verifies |
|------|----------|
| `produces 0% when denominator is 0 (no templates)` | Division-by-zero → 0 |
| `produces 100% when all templates are externally managed` | Full coverage → 100 |

### `listNonEmptyTemplates`
| Test | Verifies |
|------|----------|
| `counts only templates with more than 1 line in main.liquid` | Single-line excluded |
| `falls back to handle-named liquid file when main.liquid is absent` | Fallback liquid file used |

### `countYamlFiles`
| Test | Verifies |
|------|----------|
| `returns 0 counts when no YAML files exist` | No files → 0 |
| `counts YAML files with unit tests` | Test files counted |
| `counts files with at least 2 tests correctly` | Multi-test files counted |
| `skips YAML files with parse errors gracefully` | Parse errors non-fatal |

---

## `lib/cli/spinner.js` ← `tests/lib/cli/spinner.test.js`

### `spin`
| Test | Verifies |
|------|----------|
| `sets running=true when called` | State set on start |
| `does not start a second interval if already running` | Idempotent start |
| `writes spinner characters to stdout on interval tick` | Characters written to stdout |
| `calls readline.clearLine and cursorTo on each tick` | Line cleared before each frame |

### `stop`
| Test | Verifies |
|------|----------|
| `sets running=false` | State cleared on stop |
| `calls readline.clearLine` | Line cleared on stop |

---

## `lib/cli/cliUpdater.js` ← `tests/lib/cli/cliUpdater.spec.js`

### `CliUpdater.checkVersions`
| Test | Verifies |
|------|----------|
| `should not display update message when latest version equals current version` | No message when up-to-date |
| `should display an update message when a newer version is available` | Update message shown |
| `should not display any message when API call fails` | API failure silent |

### `CliUpdater.performUpdate`
| Test | Verifies |
|------|----------|
| `should run the update command and show a success message` | Update command run, success shown |
| `should handle update failure and show error message` | Update failure reported |

---

## `lib/cli/changelogReader.js` ← `tests/lib/cli/changelogReader.spec.js`

### `ChangelogReader.fetchChanges`
| Test | Verifies |
|------|----------|
| `should return undefined when changelog file doesn't exist (404 response)` | 404 → undefined |
| `should return undefined when API call fails` | API failure → undefined |
| `should return undefined when response status is not 200` | Non-200 → undefined |
| `should return changelog content when file exists and has new versions` | New-version content returned |
| `should return only versions between user version and update version` | Version range filtered |
| `should return version content when no new versions are found (same version)` | Same version shows current |
| `should return undefined when update version is not found in changelog` | Missing version → undefined |
| `should handle changelog with incorrect format gracefully` | Bad format → undefined |
| `should handle changelog with malformed version sections` | Malformed sections handled |
| `should handle empty changelog content` | Empty file → undefined |
| `should handle changelog with only header and no version sections` | Header-only → undefined |
| `should return content in correct order (newest to oldest)` | Sections ordered descending |

---

## `lib/cli/cwdValidator.js` ← `tests/lib/cli/cwdValidator.spec.js`

### `CwdValidator.run`
| Test | Verifies |
|------|----------|
| `should not display a warning if .git directory exists` | .git present → silent |
| `should warn about known directories` | Known non-repo dirs warned |
| `should display a warning if .git directory does not exist` | No .git → warning shown |

---

## `bin/cli.js` — `import-reconciliation` command ← `tests/bin/cli/import-reconciliation.test.js`

### Import by ID from a firm — new template
| Test | Verifies |
|------|----------|
| `should import the reconciliation by ID and create all necessary files` | Full file tree created on first import |

### Import by ID from a firm — existing template
| Test | Verifies |
|------|----------|
| `should import the reconciliation and update necessary existing files` | Existing files updated, IDs merged |

### Import by ID from a partner — new template
| Test | Verifies |
|------|----------|
| `should import reconciliation and create necessary files` | Files created with partner_id key |

### Import by ID from a partner — existing template
| Test | Verifies |
|------|----------|
| `should import the reconciliation and update necessary files` | Existing files updated for partner |

### Import by ID — error paths
| Test | Verifies |
|------|----------|
| `should handle reconciliation not found by ID` | 404 response handled |
| `should handle API error when fetching by ID` | Generic API error handled |

### Import by handle
| Test | Verifies |
|------|----------|
| `should find reconciliation by handle remotely when not local` | Remote lookup by handle succeeds |

---

## `bin/cli.js` ← `tests/e2e/cli.test.js`

### Argument validation (spawnSync)
| Test | Verifies |
|------|----------|
| `--version exits 0 and prints the package version` | Version flag works |
| `--help exits 0 and lists main commands` | Help flag works |
| `import-reconciliation with no options exits 1` | Required options enforced |
| `import-reconciliation --handle and --all together exits 1` | Conflicting flags rejected |
| `update-reconciliation --partner without --message exits 1` | Message required for partner |

### `fetchReconciliationById` (mocked sfApi)
| Test | Verifies |
|------|----------|
| `writes files to disk on success` | Files created after import |
| `calls process.exit(1) when template is not found` | Not-found → exit(1) |
| `calls process.exit(1) on API error` | API error → exit(1) |

### `fetchSharedPartById` (mocked sfApi)
| Test | Verifies |
|------|----------|
| `writes shared part files to disk on success` | Files created after import |
| `calls process.exit(1) when shared part is not found` | Not-found → exit(1) |

### `publishReconciliationByHandle` (mocked sfApi)
| Test | Verifies |
|------|----------|
| `calls SF.updateReconciliationText with correct params` | API called with right template + options |
