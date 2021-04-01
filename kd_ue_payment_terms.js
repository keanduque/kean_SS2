/**
 *
 * Module Description
 *
 * Version        	Date               		Author         		Remarks
 * 1.00            	10 Sept 2020       		kduque           	Initial version
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/ui/serverWidget', '../lib/NSUtilvSS2'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {serverWidget} serverWidget
 */
function(record, runtime, serverWidget, NSUtil) {
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(context) {
        var objRecord = context.newRecord;
        var form = context.form;
        var recType = objRecord.type;
        var subListId = '';

        if((context.type === context.UserEventType.CREATE
            || context.type === context.UserEventType.EDIT
            || context.type === context.UserEventType.COPY) &&
            (runtime.executionContext == runtime.ContextType.USER_INTERFACE) ){

            if (recType == 'customer'){
                subListId = 'recmachcustrecord_suitel10n_jp_pt_customer';
            }
            if (recType == 'vendor'){
                subListId = 'recmachcustrecord_suitel10n_jp_pt_vendor';
            }

            var sublistObj = form.getSublist({
                id : subListId
            });

            var fldClosingDate = sublistObj.getField({id: 'custrecord_suitel10n_jp_pt_closing_day'});
            var fldPaymentDueDate = sublistObj.getField({id: 'custrecord_suitel10n_jp_pt_paym_due_day'});
            var fldPaymentDueMonth = sublistObj.getField({id: 'custrecord_suitel10n_jp_pt_paym_due_mo'});

            //Disabled field in before load
            fldClosingDate.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
            fldPaymentDueDate.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
            fldPaymentDueMonth.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
        }
    }
    return {
        beforeLoad: beforeLoad
    };
});
