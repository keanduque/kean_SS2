/**
 *
 * Module Description
 * TFRD-8 : Workplan Budget Expenses Mandatory Fields
 *
 * Version        	Date               		Author         		Remarks
 * 1.00            	22 Sept 2020       		kduque           	Initial version
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', '../lib/NSUtilvSS2'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 * @param {serverWidget} serverWidget
 */
function(record, runtime, search, serverWidget, NSUtil) {

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
        var options = null;
        var subListID = 'item'

        var sublistObj = form.getSublist({
            id : subListID
        });

        var numLines = objRecord.getLineCount({
            sublistId: subListID
        });

        var strPurchord = '';
        var chkPurchOrderFlag = false;

        if((context.type === context.UserEventType.CREATE
            || context.type === context.UserEventType.EDIT
            || context.type === context.UserEventType.COPY) &&
            (runtime.executionContext == runtime.ContextType.USER_INTERFACE) ){

            options = {
                objRecord : objRecord,
                form : form,
                recType : recType
            }

            vFieldsForSublist(options); // invoke virtual fields function.

            chkPurchOrderFlag = objRecord.getValue('custbody_nscs_purchorder_flag');

            log.debug('chkPurchOrderFlag', chkPurchOrderFlag);


            if(!NSUtil.isEmpty(context.request)){
                strPurchord = context.request.parameters.transform;

                log.debug('strPurchord', strPurchord);
            }

            var reqMethod = context.request.method;

            log.debug('requestMethod', reqMethod);

            log.debug('recType', recType);

            //check if the request is GET
            if (reqMethod === 'GET' || reqMethod === 'POST') {

                // check if the Vendor Bill Transaction is from Purchase Order
                // if the request parameter is not empty
                // for transform and equals to 'purchord' do the below statements.
                if((!NSUtil.isEmpty(strPurchord) && strPurchord == 'purchord') || chkPurchOrderFlag == true) {

                    //check the PURCHASE ORDER FLAG to true
                    if(chkPurchOrderFlag != true) {
                        objRecord.setValue({
                            fieldId: 'custbody_nscs_purchorder_flag',
                            value: true
                        });
                    }

                    var fldVendor = form.getField({id: 'entity'});

                    var fldItem = sublistObj.getField({id: 'item'});
                    var fldAmount = sublistObj.getField({id: 'amount'});
                    var fldRate = sublistObj.getField({id: 'rate'});

                    var fldMasterProj = sublistObj.getField({id: 'cseg_ps_project'});
                    var fldExpType = sublistObj.getField({id: 'cseg_ps_exptype'});
                    var fldRestriction = sublistObj.getField({id: 'cseg_ps_restriction'});
                    var fldCustJob = sublistObj.getField({id: 'customer'});
                    var fldProjectTask = sublistObj.getField({id: 'projecttask'});

                    log.debug('recType inner', recType);

                    //if the record type is vendorbill disabled the fields
                    if (recType == "vendorbill") {

                        fldVendor.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });

                        fldItem.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                        fldAmount.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                        fldRate.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });

                        fldMasterProj.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                        fldExpType.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                        fldRestriction.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                        fldCustJob.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                        fldProjectTask.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                    }
                }
            }
        }
    }
    //passing this virtual fields on the client script validateLine
    //for 0 sublist line item.
    function vFieldsForSublist(options){
        var objRecord = options.objRecord;
        var form = options.form;
        var recType = options.recType;
        var itemSublist;

        var stItem, stAmount, stRate;
        var stMasterProj,
            stCustJob,
            stProjectTask,
            stExpType,
            stRestriction;
        var stDepartment, stEntity, stJELineTask;


        if (recType == "purchaseorder" ||
            recType == "vendorcredit" ||
            recType == "vendorbill") {

            itemSublist = form.getSublist('item');

            stItem = itemSublist.getField({id: 'item'});
            stAmount = itemSublist.getField({id: 'amount'});
            stRate = itemSublist.getField({id: 'rate'});

            stCustJob = itemSublist.getField({id: 'customer'});
            stProjectTask = itemSublist.getField({id: 'projecttask'});


            //virtual field for Item
            var fldItem = form.addField({
                id: 'custpage_ps_item',
                type: serverWidget.FieldType.TEXT,
                label: 'Virtual Field for Item'
            });
            fldItem.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
            objRecord.setValue({fieldId: 'custpage_ps_item', value: stItem.label});

            //virtual field for Amount
            var fldAmount = form.addField({
                id: 'custpage_ps_item_amount',
                type: serverWidget.FieldType.TEXT,
                label: 'Virtual Field for Amount'
            });
            fldAmount.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
            objRecord.setValue({fieldId: 'custpage_ps_item_amount', value: stAmount.label});

            //virtual field for Rate
            var fldRate = form.addField({
                id: 'custpage_ps_item_rate',
                type: serverWidget.FieldType.TEXT,
                label: 'Virtual Field for Rate'
            });
            fldRate.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
            objRecord.setValue({fieldId: 'custpage_ps_item_rate', value: stRate.label});

            //virtual field for Customer
            var fldCustJob = form.addField({
                id: 'custpage_ps_item_customer',
                type: serverWidget.FieldType.TEXT,
                label: 'Virtual Field for Customer'
            });
            fldCustJob.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
            objRecord.setValue({fieldId: 'custpage_ps_item_customer', value: stCustJob.label});

            //virtual field for Project Task
            var fldProjTask = form.addField({
                id: 'custpage_ps_item_projecttask',
                type: serverWidget.FieldType.TEXT,
                label: 'Virtual Field for Project Task'
            });
            fldProjTask.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
            objRecord.setValue({fieldId: 'custpage_ps_item_projecttask', value: stProjectTask.label});
        }

        //for Journal Entry and Advance Intercompany Journal Entry
        if (recType == "journalentry" || recType == "advintercompanyjournalentry") {

            itemSublist = form.getSublist('line');

            stEntity = itemSublist.getField({id: 'entity'});
            stJELineTask = itemSublist.getField({id: 'custcol_ps_je_linetask'});
            stDepartment = itemSublist.getField({id: 'department'});

            //virtual field for Department
            var fldDepartment = form.addField({
                id: 'custpage_ps_line_department',
                type: serverWidget.FieldType.TEXT,
                label: 'Virtual Field for Department'
            });
            fldDepartment.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
            objRecord.setValue({fieldId: 'custpage_ps_line_department', value: stDepartment.label});

            //virtual field for Entity
            var fldEntity = form.addField({
                id: 'custpage_ps_entity',
                type: serverWidget.FieldType.TEXT,
                label: 'Virtual Field for Entity'
            });
            fldEntity.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
            objRecord.setValue({fieldId: 'custpage_ps_entity', value: stEntity.label});

            //virtual field for JE Line Task
            var fldJELineTask = form.addField({
                id: 'custpage_ps_je_line_task',
                type: serverWidget.FieldType.TEXT,
                label: 'Virtual Field for JE Line Task'
            });
            fldJELineTask.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
            objRecord.setValue({fieldId: 'custpage_ps_je_line_task', value: stJELineTask.label});
        }

        stMasterProj = itemSublist.getField({id: 'cseg_ps_project'});
        stExpType = itemSublist.getField({id: 'cseg_ps_exptype'});
        stRestriction = itemSublist.getField({id: 'cseg_ps_restriction'});

        //virtual field for Master Project
        var fldMasterProj = form.addField({
            id: 'custpage_ps_item_mproject',
            type: serverWidget.FieldType.TEXT,
            label: 'Virtual Field for Master Project'
        });
        fldMasterProj.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
        objRecord.setValue({fieldId: 'custpage_ps_item_mproject', value: stMasterProj.label});

        //virtual field for Exp. Type
        var fldExpType = form.addField({
            id: 'custpage_ps_item_exptype',
            type: serverWidget.FieldType.TEXT,
            label: 'Virtual Field for Exp. Type'
        });
        fldExpType.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
        objRecord.setValue({fieldId: 'custpage_ps_item_exptype', value: stExpType.label});

        //virtual field for Restriction
        var fldRestriction = form.addField({
            id: 'custpage_ps_item_restriction',
            type: serverWidget.FieldType.TEXT,
            label: 'Virtual Field for Restriction'
        });
        fldRestriction.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
        objRecord.setValue({fieldId: 'custpage_ps_item_restriction', value: stRestriction.label});
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
        var sublistID = 'line';

        var intNumLines = objRecord.getLineCount({
            sublistId: sublistID
        });
        var errors = [],
            strMsg = "";

        if (context.type == context.UserEventType.CREATE
            || context.type === context.UserEventType.EDIT &&
            (runtime.executionContext == runtime.ContextType.CSV_IMPORT)){

            //validate the CSV only on JE and Advance Intercompany JE
            if (recType == "journalentry" || recType == "advintercompanyjournalentry") {

                var sublistObj = objRecord.getSublist({sublistId: sublistID});

                var colMasterProj = sublistObj.getColumn({fieldId: 'cseg_ps_project'});
                var colExpType = sublistObj.getColumn({fieldId: 'cseg_ps_exptype'});
                var colRestriction = sublistObj.getColumn({fieldId: 'cseg_ps_restriction'});
                var colDepart = sublistObj.getColumn({fieldId: 'department'});
                var colEntity = sublistObj.getColumn({fieldId: 'entity'});
                var colJELineTask = sublistObj.getColumn({fieldId: 'custcol_ps_je_linetask'});

                var lblMasterProj = colMasterProj.label;
                var lblExpType = colExpType.label;
                var lblRestriction = colRestriction.label;
                var lblDepartment = colDepart.label;
                var lblEntity = colEntity.label;
                var lblJELineTask = colJELineTask.label;

                strMsg = "Please enter value(s) for: ";

                for(var int = 0; int < intNumLines; int++){

                    var sublistMasterProj = objRecord.getSublistValue({
                        sublistId: sublistID,
                        fieldId: 'cseg_ps_project',
                        line: int
                    });
                    var sublistExpType = objRecord.getSublistValue({
                        sublistId: sublistID,
                        fieldId: 'cseg_ps_exptype',
                        line: int
                    });
                    var sublistRestriction = objRecord.getSublistValue({
                        sublistId: sublistID,
                        fieldId: 'cseg_ps_restriction',
                        line: int
                    });
                    var sublistDepartment = objRecord.getSublistValue({
                        sublistId: sublistID,
                        fieldId: 'department',
                        line: int
                    });
                    var sublistEntity = objRecord.getSublistValue({
                        sublistId: sublistID,
                        fieldId: 'entity',
                        line: int
                    });
                    var sublistJELineTask = objRecord.getSublistValue({
                        sublistId: sublistID,
                        fieldId: 'custcol_ps_je_linetask',
                        line: int
                    });
                    var sublistAccountType = objRecord.getSublistValue({
                        sublistId: sublistID,
                        fieldId: 'custcol_je_account_type_source',
                        line: int
                    });

                    log.debug('sublistAccountType', sublistAccountType);

                    log.debug('lblMasterProj', lblMasterProj);
                    log.debug('lblExpType', lblExpType);
                    log.debug('lblRestriction', lblRestriction);
                    log.debug('lblDepartment', lblDepartment);
                    log.debug('lblEntity', lblEntity);
                    log.debug('lblJELineTask', lblJELineTask);

                    if (NSUtil.isEmpty(sublistMasterProj)) { // Master Project
                        errors.push(lblMasterProj);
                    }
                    if (NSUtil.isEmpty(sublistExpType)) { // Expenditure Type
                        errors.push(lblExpType);
                    }
                    if (NSUtil.isEmpty(sublistRestriction)) { //RESTRICTED
                        errors.push(lblRestriction);
                    }
                    // if (NSUtil.isEmpty(sublistDepartment)) { // Department
                    //     errors.push(lblDepartment);
                    // }
                    if (NSUtil.isEmpty(sublistEntity)) { // Entity
                        errors.push(lblEntity);
                    }
                    if (NSUtil.isEmpty(sublistJELineTask)) { // JE Line Task
                        errors.push(lblJELineTask);
                    }

                    /**
                     * Account Type : sublistAccountType
                     * 2 - Accounts Receivable
                     * 11 - Income
                     * 13 - Expense
                     */

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
                            log.debug('errors', errors);

                            throw strMsg;
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

                            throw strMsg;
                        }
                    }
                }
            }
        }
    }
    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit
    };

});
