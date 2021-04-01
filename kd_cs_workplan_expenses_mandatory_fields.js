/**
 *
 * Module Description
 * TFRD-8 : Workplan Budget Expenses Mandatory Fields
 *
 * Version          Date                    Author              Remarks
 * 1.00             22 Sept 2020            kduque              Initial version
 *
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/ui/dialog', '../lib/NSUtilvSS2'],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     * @param {serverWidget} serverWidget
     */
    function(record, runtime, dialog, NSUtil) {

        var objScript = runtime.getCurrentScript();

        var INIT_MANDATORY_MSG = objScript.getParameter({
            name: 'custscript_nscs_cs_initial_msg_mandatory'
        });

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(context) {
            var currentRecord = context.currentRecord;
            var sublistID = context.sublistId;
            var fieldId = context.fieldId;
            var line = context.line;
            var recType = currentRecord.type;

            if(fieldId == 'cseg_ps_restriction') {

                //check if the recordType is PO or Bill then
                //line 0 or 1 then set the values of sublist Restricted line to Restricted body field
                if (recType == 'purchaseorder' ||
                    recType == 'vendorbill' ||
                    recType == 'vendorcredit') {

                    if(!NSUtil.isEmpty(sublistID)) {
                        var sublistRestriction = currentRecord.getCurrentSublistValue({
                            sublistId: sublistID,
                            fieldId: 'cseg_ps_restriction'
                        });

                        if (line == 0) {
                            currentRecord.setValue({
                                fieldId: 'cseg_ps_restriction',
                                value: sublistRestriction
                            });
                        }
                    }
                }
            }
        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(context) {
            var currentRecord = context.currentRecord;
            var sublistID = context.sublistId;
            var recType = currentRecord.type;

            var numLines = currentRecord.getLineCount({
                sublistId: sublistID
            });

            var options = {
                record : currentRecord,
                sublistId : sublistID,
                recordType : recType,
                numberLine : numLines
            }

            if (sublistID === 'item') {
                //validate sublist for mandatory fields.
                return mandatoryCheckSublist(options);
            }
            if (sublistID === 'line') {
                //validate sublist for mandatory fields.
                return mandatoryCheckSublist(options);
            }

            return true;
        }

        function mandatoryCheckSublist(option){
            log.debug('option', option);

            var currentRecord = option.record,
                sublistID = option.sublistId,
                recType = option.recordType,
                numLines = option.numberLine;

            var errors = [],
                strMsg = "";

            var sublistMasterProj = currentRecord.getCurrentSublistValue({
                sublistId: sublistID,
                fieldId: 'cseg_ps_project'
            });
            var sublistExpType = currentRecord.getCurrentSublistValue({
                sublistId: sublistID,
                fieldId: 'cseg_ps_exptype'
            });
            var sublistRestriction = currentRecord.getCurrentSublistValue({
                sublistId: sublistID,
                fieldId: 'cseg_ps_restriction'
            });
            var sublistCustJob = currentRecord.getCurrentSublistValue({
                sublistId: sublistID,
                fieldId: 'customer'
            });
            var sublistProjectTask = currentRecord.getCurrentSublistValue({
                sublistId: sublistID,
                fieldId: 'projecttask'
            });
            //BEGIN : Vendor Bill additional fields for mandatory
            var sublistItem = currentRecord.getCurrentSublistValue({
                sublistId: sublistID,
                fieldId: 'item'
            });
            var sublistAmount = currentRecord.getCurrentSublistValue({
                sublistId: sublistID,
                fieldId: 'amount'
            });
            var sublistRate = currentRecord.getCurrentSublistValue({
                sublistId: sublistID,
                fieldId: 'rate'
            });
            //END : Vendor Bill additional fields for mandatory

            //BEGIN : JE & AJE additional fields for mandatory
            var sublistDepartment = currentRecord.getCurrentSublistValue({
                sublistId: sublistID,
                fieldId: 'department'
            });

            var sublistEntity = currentRecord.getCurrentSublistValue({
                sublistId: sublistID,
                fieldId: 'entity'
            });

            var sublistJELineTask = currentRecord.getCurrentSublistValue({
                sublistId: sublistID,
                fieldId: 'custcol_ps_je_linetask'
            });

            var sublistAccountType = currentRecord.getCurrentSublistValue({
                sublistId: sublistID,
                fieldId: 'custcol_je_account_type_source'
            });
            //END : JE & AJE additional fields for mandatory

            //Get virtual fields from the UE script beforeLoad
            var lblItem = currentRecord.getValue('custpage_ps_item'),
                lblAmount = currentRecord.getValue('custpage_ps_item_amount'),
                lblRate = currentRecord.getValue('custpage_ps_item_rate'),
                lblMasterProj = currentRecord.getValue('custpage_ps_item_mproject'),
                lblExpType = currentRecord.getValue('custpage_ps_item_exptype'),
                lblRestriction = currentRecord.getValue('custpage_ps_item_restriction'),
                lblCustJob = currentRecord.getValue('custpage_ps_item_customer'),
                lblProjectTask = currentRecord.getValue('custpage_ps_item_projecttask'),
                lblDepartment = currentRecord.getValue('custpage_ps_line_department'),
                lblEntity = currentRecord.getValue('custpage_ps_entity'),
                lblJELineTask = currentRecord.getValue('custpage_ps_je_line_task');

            strMsg = INIT_MANDATORY_MSG + " ";

            if (NSUtil.isEmpty(sublistMasterProj)) { // Master Project
                errors.push(lblMasterProj);
            }
            if (NSUtil.isEmpty(sublistExpType)) { // Expenditure Type
                errors.push(lblExpType);
            }
            if (NSUtil.isEmpty(sublistRestriction)) { //RESTRICTED
                errors.push(lblRestriction);
            }

            //validation for PO and Vendor Credit
            if(recType == "purchaseorder" || recType == "vendorcredit"){

                if (NSUtil.isEmpty(sublistCustJob)) { // Customer : Job
                    errors.push(lblCustJob);
                }
                if (NSUtil.isEmpty(sublistProjectTask)) { // Project Task
                    errors.push(lblProjectTask);
                }

                strMsg += errors.join(", ");

                if (NSUtil.isEmpty(sublistMasterProj) ||
                    NSUtil.isEmpty(sublistExpType) ||
                    NSUtil.isEmpty(sublistRestriction) ||
                    NSUtil.isEmpty(sublistCustJob) ||
                    NSUtil.isEmpty(sublistProjectTask)  && errors.length > 0 ) {

                    alert(strMsg);

                    return false;
                }
            }
            //validation for Vendor Bill additional fields are Item, Amount, Rate
            if(recType == "vendorbill"){


                var chkPurchOrderFlag = currentRecord.getValue('custbody_nscs_purchorder_flag');

                // if transaction is vendorcredit, only 1 line can be added.
                // if add additional row it will return error, based on 2.1.3 FRD
                log.debug('numLines', numLines);
                log.debug('sublistItem', sublistItem);

                if(chkPurchOrderFlag == true) {
                    if (NSUtil.isEmpty(sublistItem)) {
                        alert('Adding additional rows is not allowed');

                        return false;
                    }
                } else {

                    if (NSUtil.isEmpty(sublistItem)) { // Item
                        errors.push(lblItem);
                    }
                    if (NSUtil.isEmpty(sublistAmount)) { // Amount
                        errors.push(lblAmount);
                    }
                    if (NSUtil.isEmpty(sublistRate)) { // Rate
                        errors.push(lblRate);
                    }

                    if (NSUtil.isEmpty(sublistCustJob)) { // Customer : Job
                        errors.push(lblCustJob);
                    }
                    if (NSUtil.isEmpty(sublistProjectTask)) { //Project Task
                        errors.push(lblProjectTask);
                    }

                    strMsg += errors.join(", ");

                    if (NSUtil.isEmpty(sublistItem) ||
                        NSUtil.isEmpty(sublistAmount) ||
                        NSUtil.isEmpty(sublistRate) ||
                        NSUtil.isEmpty(sublistMasterProj) ||
                        NSUtil.isEmpty(sublistExpType) ||
                        NSUtil.isEmpty(sublistRestriction) ||
                        NSUtil.isEmpty(sublistCustJob) ||
                        NSUtil.isEmpty(sublistProjectTask) && errors.length > 0) {

                        alert(strMsg);

                        return false;
                    }
                }
            }
            //validation for JE and AJE additional fields is Department
            if(recType == "journalentry" || recType == "advintercompanyjournalentry"){
                /**
                 * Account Type : sublistAccountType
                 * 2 - Accounts Receivable
                 * 11 - Income
                 * 13 - Expense
                 */

                if (NSUtil.isEmpty(sublistEntity)) { // Entity
                    errors.push(lblEntity);
                }
                if (NSUtil.isEmpty(sublistJELineTask)) { // JE Line Task
                    errors.push(lblJELineTask);
                }

                /**
                 * Journal Entry Expense type (Account): 13
                 *      master Project, Expenditure Type, Restriction, customer: Job, and Project task
                 *      sublistMasterProj, sublistExpType, sublistRestriction, sublistEntity and sublistJELineTask
                 */
                if(sublistAccountType == 13) {
                    if (NSUtil.isEmpty(sublistMasterProj) ||
                        NSUtil.isEmpty(sublistExpType) ||
                        NSUtil.isEmpty(sublistRestriction) ||
                        NSUtil.isEmpty(sublistEntity) ||
                        NSUtil.isEmpty(sublistJELineTask) && errors.length > 0) {

                        strMsg += errors.join(", ");

                        log.debug('strMsg', strMsg);

                        alert(strMsg);

                        return false;
                    }
                }
                /**
                 * Journal Entry income type (Account): 11
                 *      master Project, Restriction, customer: Job
                 *      sublistMasterProj, sublistRestriction, sublistEntity
                 */
                if(sublistAccountType == 11) {
                    if (NSUtil.isEmpty(sublistMasterProj) ||
                        NSUtil.isEmpty(sublistRestriction) ||
                        NSUtil.isEmpty(sublistEntity) && errors.length > 0) {

                        //find the label to remove on the errors array
                        var findExpType = errors.indexOf(lblExpType);
                        var findJELineTask = errors.indexOf(lblJELineTask) - 1;

                        //remove the find elements in the errors array
                        errors.splice(findExpType, 1);
                        errors.splice(findJELineTask, 1);

                        //join the errors
                        strMsg += errors.join(", ");

                        alert(strMsg);

                        return false;
                    }
                }
            }

            return true;
        }
        return {
            fieldChanged: fieldChanged,
            validateLine: validateLine
        };

    });
