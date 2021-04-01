/**
 *
 * Module Description
 * PRC-5 Gap No.35 貸出商品確認書PDF　Consignment Statement PDF - Workflow
 *
 * Version        	Date               		Author         		Remarks
 * 1.00            	19 October 2020       	kduque           	Initial version
 *
 * @NApiVersion 2.0
 * @NScriptType workflowactionscript
 */
define(['N/runtime', '../lib/ps_lib_task', 'N/search', 'N/format'],
    /**
     * @param {runtime} runtime
     * @param {psLibTask} psLibTask
     */
    function(runtime, psLibTask, search, format) {

        var objScript = runtime.getCurrentScript();

        var ERROR_MSG = objScript.getParameter({
            name: 'custscript_nscs_wa_35_error_msg'
        });

        var LOG_TITLE = "nscs_wa_consignment";

        var MAP_REDUCE_SCRIPT = 'customscript_nscs_mr_consignment';

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {Record} context.newRecord - New record
         * @param {Record} context.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(context) {
            var objRecord = context.newRecord;

            try
            {
                var	stRecID = context.newRecord.id;
                var objParams = {
                    'custscript_ps_mr_consign_exec' : stRecID
                };
                var stDeploymentSID = 'customdeploy_nscs_mr_consignment';

                var bAfterDateExist = getSearchDate(objRecord);

                log.debug('bAfterDateExist', bAfterDateExist);

                /**
                 * NS_締め請求_ステータス Error Status
                 * 1 - Not Started
                 * 2 - Processing
                 * 3 - Completed
                 * 4 - Error
                 */
                if (bAfterDateExist) {

                    objRecord.setValue({
                        fieldId: 'custrecord_ns_cs_status',
                        value: 4
                    });
                    objRecord.setValue({
                        fieldId: 'custrecord_ns_cs_error',
                        value: ERROR_MSG
                    });

                    throw ERROR_MSG;
                } else {
                    objRecord.setValue({
                        fieldId: 'custrecord_ns_cs_status',
                        value: 2
                    });

                    log.debug('params', {
                        recordid: stRecID,
                        script: MAP_REDUCE_SCRIPT
                    });

                    // trigger MR script
                    var stScriptTaskId = psLibTask.createMRTaskAndSubmit(MAP_REDUCE_SCRIPT, stDeploymentSID, objParams);

                    log.audit(LOG_TITLE, 'Task successfully submitted: ' + stScriptTaskId);
                }
            }

            catch(ex)
            {
                var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' : ex.toString();
                log.error('Error: onAction()', errorStr);
            }

        }
        //create save search to get date on consignment statement execution screen.
        function getSearchDate(objRecord){

            var dtCSDate = objRecord.getValue('custrecord_ns_cs_date');

            if(dtCSDate) {
                var strFormatCSDate = format.format({value: dtCSDate, type: format.Type.DATE});

                var dateSearch = search.create({
                    type: 'customrecord_ns_cs_execution',
                    filters: [
                        search.createFilter({
                            name: 'custrecord_ns_cs_date',
                            operator: search.Operator.AFTER,
                            values: strFormatCSDate
                        })
                    ],
                    columns: [
                        search.createColumn({
                            name: 'custrecord_ns_cs_date'
                        }),
                        search.createColumn({
                            name: 'custrecord_ns_cs_status'
                        }),
                        search.createColumn({
                            name: 'custrecord_ns_cs_error'
                        })
                    ]
                });

                var searchCountResult = dateSearch.runPaged().count;
                log.debug('searchCountResult count', searchCountResult);

                // return true if the date exist after the specified date
                return searchCountResult > 0;
            }
            return false;
        }
        return {
            onAction : onAction
        };
    });
