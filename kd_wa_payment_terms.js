/**
 * Module Description
 *
 * Version        	Date               		Author         		Remarks
 * 1.00            	14 Sept 2020       		kduque           	Initial version
 *
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/record', 'N/runtime', 'N/ui/serverWidget', '../lib/NSUtilvSS2'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {serverWidget} serverWidget
 */
function(record, runtime, serverWidget, NSUtil) {
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
        var recType = objRecord.type;
        var subListId = '';

        var fldClosingDateId = '';
        var fldPaymentDueDateId = '';
        var fldPaymentDueMonthId = '';

        //start action for create, update and delete sublist
        if(recType == 'customer'){
            subListId = 'recmachcustrecord_suitel10n_jp_pt_customer';
        }
        if(recType == 'vendor'){
            subListId =  'recmachcustrecord_suitel10n_jp_pt_vendor';
        }
        log.debug('subListId', subListId);

        //load existing record
        objRecord = record.load({
            type: recType,
            id: objRecord.id,
            isDynamic: true
        });

        var lineCount = objRecord.getLineCount({
            sublistId: subListId
        });

        try {
            if (lineCount == 0) {
                createSublist(objRecord, subListId);
            }
            fldClosingDateId = objRecord.getValue('custentity_ns_6_9_close_dt_after');
            fldPaymentDueDateId = objRecord.getValue('custentity_ns_6_9_due_dt_after');
            fldPaymentDueMonthId = objRecord.getValue('custentity_ns_6_9_pay_month_after');

            if (lineCount == 1) {
                if (NSUtil.isEmpty(fldClosingDateId) &&
                    NSUtil.isEmpty(fldPaymentDueDateId) &&
                    NSUtil.isEmpty(fldPaymentDueMonthId)) {
                    //deleting sublist
                    deleteSublist(objRecord, subListId);
                } else {
                    //updating sublist
                    updateSublist(objRecord, subListId);
                }
            }
        } catch(ex){
            var stError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' : ex.toString();
            log.error('Error: onAction()', stError);
        }
    }
    //setting current sublist to call in function in Dynamic Mode
    function setCurrentSublistCall(objRecord, subListId){
        var fldClosingDateId = objRecord.getValue('custentity_ns_6_9_close_dt_after');
        var fldPaymentDueDateId = objRecord.getValue('custentity_ns_6_9_due_dt_after');
        var fldPaymentDueMonthId = objRecord.getValue('custentity_ns_6_9_pay_month_after');

        objRecord.setCurrentSublistValue({
            sublistId : subListId,
            fieldId : 'custrecord_suitel10n_jp_pt_closing_day',
            value   : fldClosingDateId
        });
        objRecord.setCurrentSublistValue({
            sublistId : subListId,
            fieldId : 'custrecord_suitel10n_jp_pt_paym_due_day',
            value   : fldPaymentDueDateId
        });
        objRecord.setCurrentSublistValue({
            sublistId : subListId,
            fieldId : 'custrecord_suitel10n_jp_pt_paym_due_mo',
            value   : fldPaymentDueMonthId
        });
        //commit currently selected line on the sublist
        objRecord.commitLine({
            sublistId: subListId
        });
        //save/update sublist
        objRecord.save();
    }
    //creating sublist line
    function createSublist(objRecord, subListId){
        objRecord.selectNewLine({
            sublistId: subListId
        });
        setCurrentSublistCall(objRecord, subListId);

        log.debug('creating Sublist');
    }
    //update sublist line base on field value
    function updateSublist(objRecord, subListId){
        var indexLine = 0;

        //select existing line in a sublist (dynamic mode only)
        objRecord.selectLine({
            sublistId: subListId,
            line: indexLine
        });

        setCurrentSublistCall(objRecord, subListId);

        log.debug('updating Sublist');
    }
    //deleting sublist line
    function deleteSublist(objRecord, subListId){
        var indexLine = 0;

        objRecord.selectLine({
            sublistId: subListId,
            line: indexLine
        });
        objRecord.removeLine({
            sublistId: subListId,
            line: indexLine,
            ignoreRecalc: true
        });
        objRecord.save();

        log.debug('deleting Sublist');
    }
    return {
        onAction : onAction
    };
});
