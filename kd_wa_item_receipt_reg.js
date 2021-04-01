/**
 * Module Description
 * Gap#30 : Item Receipt Register
 *
 * Version        	Date               		Author         		Remarks
 * 1.00            	07 October 2020       	kduque           	Initial version
 *
 * @NApiVersion 2.0
 * @NScriptType workflowactionscript
 */
define(['N/runtime', '../lib/ps_lib_task'],
    /**
     * @param {runtime} runtime
     * @param {psLibTask} psLibTask
     */
    function(runtime, psLibTask) {

        var LOG_TITLE = "nscs_wa_item_receipt_reg";

        var MAP_REDUCE_SCRIPT = 'customscript_nscs_mr_30_itm_rcpt_reg';

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {Record} context.newRecord - New record
         * @param {Record} context.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(context) {

            try
            {
                var	stRecID = context.newRecord.id;
                var objParams = {
                    'custscript_ps_mr_item_recpt_reg' : stRecID
                };

                // trigger script without deployment ID; to use available deployment
                var stScriptTaskId = psLibTask.createMRTaskAndSubmit(MAP_REDUCE_SCRIPT, null, objParams);

                // if no available deployment, create deployment record and submit
                if (stScriptTaskId == "NO_DEPLOYMENTS_AVAILABLE")
                {
                    log.audit(LOG_TITLE, stScriptTaskId);

                    // create deployment record by copying default deployment
                    var stDeploymentSID = psLibTask.copyDeploymentRecord(MAP_REDUCE_SCRIPT);

                    // trigger script using new deployment
                    stScriptTaskId = psLibTask.createMRTaskAndSubmit(MAP_REDUCE_SCRIPT, stDeploymentSID, objParams);
                }

                log.debug('params', {
                    recordid: stRecID,
                    script: MAP_REDUCE_SCRIPT
                });

                log.audit(LOG_TITLE, 'Task successfully submitted: ' + stScriptTaskId);
            }
            catch(ex)
            {
                var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' : ex.toString();
                log.error('Error: onAction()', errorStr);
            }

        }
        return {
            onAction : onAction
        };
    });
