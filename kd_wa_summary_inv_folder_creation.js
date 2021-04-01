/**
 *
 * Module Description
 *
 * Version        	Date               		Author         		Remarks
 * 1.00            	18 Sept 2020       		kduque           	Initial version
 *
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/record',
        'N/runtime',
        'N/search',
        '../lib/NSUtilvSS2',
        '../lib/ps_lib_task'
        ,'N/format'],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     * @param {NSUtil} NSUtil
     * @param {psLibTask} psLibTask
     * @param {format} format
     */
    function(record, runtime, search, NSUtil, psLibTask, format) {

        var objScript = runtime.getCurrentScript();

        var FOLDER_ID = objScript.getParameter({
            name: 'custscript_nscs_sum_inv_folder_id'
        });
        var FOLDER_SEARCH = objScript.getParameter({
            name: 'custscript_nsps_wa_folder_search'
        });
        var FOLDER_SEND_LABEL = objScript.getParameter({
            name: 'custscript_ps_mr_si_send_folder_lbl'
        });

        var FOLDER_NOSEND_LABEL = objScript.getParameter({
            name: 'custscript_ps_mr_si_nosend_folder_lbl'
        });

        var EXEC_STS_NOT_STARTED = 1;
        var EXEC_STS_PROCESSING = 2;
        var EXEC_STS_COMPLETED = 3;
        var EXEC_STS_ERROR = 4;

        var ERROR_MESSAGE = objScript.getParameter({
            name: 'custscript_ps_mr_si_error_msg'
        });

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(context) {
            var objRecord = context.newRecord;
            var folderId = null;

            var booDupClosingDate = getSummaryExecDupCloseDt(objRecord);
            if (booDupClosingDate) {
                throw ERROR_MESSAGE
            }

            objRecord.setValue({fieldId : 'custrecord_ns_cie_status', value : EXEC_STS_PROCESSING });
            objRecord.setValue({fieldId : 'custrecord_ns_cie_exec_error', value : '' });
            var strFolderName = getFolderName(objRecord.id); // get folder name via search

            var folder = record.create({
                type: record.Type.FOLDER,
                isDynamic: true
            });

            if(folder) {
                folder.setValue({
                    fieldId: 'parent',
                    value: FOLDER_ID //assign to Summary Invoice Folder - ID : 926
                });
                folder.setValue({
                    fieldId: 'name',
                    value: strFolderName
                });
                folderId = folder.save();

                log.debug('folderId', folderId);

                createSubFolder(folderId, FOLDER_SEND_LABEL);
                createSubFolder(folderId, FOLDER_NOSEND_LABEL);

                log.debug('strFolderName : ', strFolderName)

                objRecord.setValue({
                    fieldId: 'custrecord_ns_cie_folder',
                    value: folderId
                });

                try {
                    // check if script is already running
                    if (!isExecutingMRScript()) {
                        var objSummExec = getSummExecInformation(objRecord);

                        var objParams = {
                            'custscript_summary_exec': objRecord.id,
                            'custscript_ps_mr_closing_day' : objSummExec.day,
                            'custscript_ps_mr_folder_id' : folderId
                        };

                        var startDate = objSummExec.start_date;
                        var endDate = objSummExec.end_date;
                        if (startDate) {
                            startDate = format.parse({value: startDate, type: format.Type.DATE});
                            objParams['custscript_ps_mr_start_date'] = startDate;
                        }
                        if (endDate) {
                            endDate = format.parse({value: endDate, type: format.Type.DATE});
                            objParams['custscript_ps_mr_close_date'] = endDate;
                        }


                        // always call first deployment
                        var stScriptTaskId = psLibTask.createMRTaskAndSubmit('customscript_nscs_mr_summary_invoice', 'customdeploy_nscs_mr_summary_invoice_1', objParams);
                    }
                } catch (ex) {
                    var errorStr = (ex.getCode != null) ? ex.getCode() + '\n'
                        + ex.getDetails() + '\n' : ex.toString();
                    log.error('ERROR_ENCOUNTERED', errorStr);
                }


                log.audit('stScriptTaskId', stScriptTaskId);
            }
        }

        function getSummExecInformation(objRecord){
            var objSummaryExec = {};
            try {
                var customrecord_ns_si_executionSearchObj = search.create({
                    type: 'customrecord_ns_si_execution',
                    filters:
                        [
                            ['internalid','anyof',objRecord.id]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: 'formulatext',
                                formula: "TO_CHAR({custrecord_ns_cie_closing_date}, 'DD')",
                                label: 'day'
                            }),

                            search.createColumn({
                                name: 'formuladate',
                                formula: 'ADD_MONTHS({custrecord_ns_cie_closing_date},-1)+1',
                                label: 'start_date'
                            }),
                            search.createColumn({
                                name: 'formuladate',
                                formula: '{custrecord_ns_cie_closing_date}',
                                label: 'end_date'
                            })
                        ]
                });
                var searchResultCount = customrecord_ns_si_executionSearchObj.runPaged().count;
                log.debug('customrecord_ns_si_executionSearchObj result count',searchResultCount);
                customrecord_ns_si_executionSearchObj.run().each(function(result){
                    var cols = result.columns;
                    for ( var i in cols) {
                        var col = cols[i];
                        objSummaryExec[col.label] = result.getValue(col);
                    }
                    return true;
                });
            } catch (ex) {
                var errorStr = (ex.getCode != null) ? ex.getCode() + '\n'
                    + ex.getDetails() + '\n' : ex.toString();
                log.error('ERROR_ENCOUNTERED : getSummExecInformation', errorStr);
            }
            log.audit('getSummExecInformation','objSummaryExec='+JSON.stringify(objSummaryExec));
            return objSummaryExec;
        }

        function isExecutingMRScript() {
            log.audit('isExecutingMRScript', 'START');
            var objSearch = search.create({
                type:		record.Type.SCHEDULED_SCRIPT_INSTANCE,
                filters:    [
                    ['status','anyof','PENDING','PROCESSING','RESTART','RETRY']
                    ,'AND',
                    [['script.scriptid',search.Operator.IS,'customscript_nscs_mr_summary_invoice'],'OR',['script.scriptid',search.Operator.IS,'customscript_nscs_mr_summary_invoice_pdf']]

                ],
                columns:	['status', 'script.internalid']
            })

            var searchResultCount = objSearch.runPaged().count;
            log.debug('isExecutingMRScript', 'searchResultCount='+searchResultCount);
            return (searchResultCount > 0);
        }

        //creating subFolder for Parent Folder
        function createSubFolder(parentId, strValue){
            var subFolder = record.create({
                type: record.Type.FOLDER,
                isDynamic: true
            });
            subFolder.setValue({
                fieldId: 'parent',
                value: parentId //assign to parentId
            });
            subFolder.setValue({
                fieldId: 'name',
                value: strValue
            });

            subFolder.save();

            log.debug('saving subFolder');
        }
        /**
         * Getting folder name via save search
         * Save Search Name : SCRIPT : Summary Execution Folder
         * Save Search ID : customsearch_nscs_summ_execution
         */
        function getFolderName(internalId){
            var folderName = null;

            var folderNameSearch = search.load({
                id: FOLDER_SEARCH
            });

            var filters = [
                search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.ANYOF,
                    values: internalId
                })
            ];
            folderNameSearch.filters = filters;

            folderNameSearch.run().each(function(result) {

                folderName = result.getValue({
                    name : 'formulatext',
                    formula: "TO_CHAR({custrecord_ns_cie_closing_date},'YYYYMMDD') || '締-' || TO_CHAR({today}, 'YYYYMMDDHH24MISS')"
                });

                return true;
            });

            return folderName;
        }

        var EXEC_STS_NOT_STARTED = 1;
        var EXEC_STS_PROCESSING = 2;
        var EXEC_STS_COMPLETED = 3;
        var EXEC_STS_ERROR = 4;


        function getSummaryExecDupCloseDt(newRecord){
            var objClosingDt = newRecord.getValue({fieldId : 'custrecord_ns_cie_closing_date'});
            if (objClosingDt) {
                var strClosingDt = format.format({value:objClosingDt, type: format.Type.DATE});

                var filters = [
                    ['custrecord_ns_cie_closing_date','on',strClosingDt],
                    'AND',
                    ['custrecord_ns_cie_status','anyof', EXEC_STS_PROCESSING]
                ]
                if (newRecord.id) {
                    filters.push('AND');
                    filters.push(['internalid','noneof', newRecord.id]);
                }
                var objSummaryExecSearch = search.create({
                    type: 'customrecord_ns_si_execution',
                    filters: filters
                    ,
                    columns:
                        [
                            search.createColumn({name: 'internalid'}),

                        ]
                });
                var searchResultCount = objSummaryExecSearch.runPaged().count;
                log.debug('objSummaryExecSearch result count',searchResultCount);
                return searchResultCount > 0
            }
            return false;


        }

        return {
            onAction : onAction
        };
    });
