/**
 *
 * Module Description
 *
 * Version          Date                    Author              Remarks
 * 1.00             10 Sept 2020            kduque              Initial version
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
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(context) {
        var objRecord = context.newRecord;
        var recType = objRecord.type;
        var subListId = '';

        var fldClosingDateId = '';
        var fldPaymentDueDateId = '';
        var fldPaymentDueMonthId = '';

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

            var lineCount = objRecord.getLineCount({
                sublistId: subListId
            });

            if(lineCount == 0){
                createSublist(objRecord, subListId, lineCount);

                log.debug('creating Sublist beforeSubmit');
            }

            fldClosingDateId = objRecord.getValue('custentity_ns_6_9_close_dt_after');
            fldPaymentDueDateId = objRecord.getValue('custentity_ns_6_9_due_dt_after');
            fldPaymentDueMonthId = objRecord.getValue('custentity_ns_6_9_pay_month_after');

            if (lineCount == 1) {
                if(NSUtil.isEmpty(fldClosingDateId) &&  NSUtil.isEmpty(fldPaymentDueDateId) && NSUtil.isEmpty(fldPaymentDueMonthId) ){
                    //deleting sublist
                    deleteSublist(objRecord, subListId);

                    log.debug('process delete first step');
                }

                //updating sublist
                updateSublist(objRecord, subListId);
                log.debug('updating Sublist beforeSubmit');
            }
        }
    }

    //setting sublist to call in function
    function setSublistCall(objRecord, subListId, lineCount){
        var fldClosingDateId = objRecord.getValue('custentity_ns_6_9_close_dt_after');
        var fldPaymentDueDateId = objRecord.getValue('custentity_ns_6_9_due_dt_after');
        var fldPaymentDueMonthId = objRecord.getValue('custentity_ns_6_9_pay_month_after');

        objRecord.setSublistValue({
            sublistId : subListId,
            fieldId : 'custrecord_suitel10n_jp_pt_closing_day',
            line    : lineCount,
            value   : fldClosingDateId
        });

        objRecord.setSublistValue({
            sublistId : subListId,
            fieldId : 'custrecord_suitel10n_jp_pt_paym_due_day',
            line    : lineCount,
            value   : fldPaymentDueDateId
        });

        objRecord.setSublistValue({
            sublistId : subListId,
            fieldId : 'custrecord_suitel10n_jp_pt_paym_due_mo',
            line    : lineCount,
            value   : fldPaymentDueMonthId
        });

        log.debug('set Sublist CALL');
    }
    //creating sublist line
    function createSublist(objRecord, subListId, lineCount){

        setSublistCall(objRecord, subListId, lineCount);
        log.debug('creating Sublist');

    }
    //update sublist line base on field value
    function updateSublist(objRecord, subListId){
        var indexLine = 0;

        var stClosingDay = objRecord.getSublistValue({
            sublistId : subListId,
            fieldId : 'custrecord_suitel10n_jp_pt_closing_day',
            line    : indexLine
        });

        var stPaymentDueDate = objRecord.getSublistValue({
            sublistId : subListId,
            fieldId : 'custrecord_suitel10n_jp_pt_paym_due_day',
            line    : indexLine
        });

        var stPaymentMonth = objRecord.getSublistValue({
            sublistId : subListId,
            fieldId : 'custrecord_suitel10n_jp_pt_paym_due_mo',
            line    : indexLine
        });

        if(!NSUtil.isEmpty(stClosingDay) || !NSUtil.isEmpty(stPaymentDueDate) || !NSUtil.isEmpty(stPaymentMonth)) {

            setSublistCall(objRecord, subListId, indexLine);

            log.debug('updateSublist Validation trigger...');
        }
    }

    //deleting sublist line
    function deleteSublist(objRecord, subListId){
        objRecord.removeLine({
            sublistId: subListId,
            line: 0,
            ignoreRecalc: true
        });
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit
    };

});
