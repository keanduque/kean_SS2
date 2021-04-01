/**
 *
 * Module Description
 *
 * Version        	Date               		Author         		Remarks
 * 1.00            	04 Sept 2020       		kduque           	Initial version
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/runtime', 'N/search', './lib/NSUtilvSS2'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(record, runtime, search, NSUtil) {

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
        var form = scriptContext.form;
        var itemSublist = form.getSublist('item');

        if((scriptContext.type === scriptContext.UserEventType.CREATE
            || scriptContext.type === scriptContext.UserEventType.EDIT
            || scriptContext.type === scriptContext.UserEventType.COPY) &&
            (runtime.executionContext == runtime.ContextType.USER_INTERFACE) ){

            var fldDept = itemSublist.getField({id: 'department'});
            var fldClass = itemSublist.getField({id: 'class'});

            fldDept.isMandatory = true;
            fldClass.isMandatory = true;
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
    function beforeSubmit(scriptContext) {

        if(scriptContext.type === scriptContext.UserEventType.CREATE &&
            (runtime.executionContext == runtime.ContextType.CSV_IMPORT)){

            var objRecord = scriptContext.newRecord;
            var intNumLines = objRecord.getLineCount({
                sublistId: 'item'
            });

            var clientId = objRecord.getValue({
                fieldId: 'partner'
            });
            var deptLookUp = null;
            var stLookUpVal = '';
            var objDeptLookup = null;

            if (!isNullOrEmpty(clientId)){
                deptLookUp = search.lookupFields({
                    type: 'partner',
                    id: clientId,
                    columns: ['department']
                });
                objDeptLookup = deptLookUp.department[0]; // department
            }

            for(var int = 0; int < intNumLines; int++){
                var dept = objRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'department',
                    line: int
                });

                if(!NSUtil.isEmpty(objDeptLookup)){
                    stLookUpVal = objDeptLookup.value; //department value
                }
                log.debug('stLookUpVal', stLookUpVal);

                if(NSUtil.isEmpty(dept) && NSUtil.isEmpty(stLookUpVal)){
                    throw 'Department is a Mandatory field';
                }

                if(NSUtil.isEmpty(dept)){
                    objRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'department',
                        line: int,
                        value: stLookUpVal
                    });
                }
                var stClass = objRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'class',
                    line: int
                });
                log.debug('getClass', stClass);

                if(NSUtil.isEmpty(stClass)){
                    throw 'No value for class';
                }
            }
        }
    }
    function isNullOrEmpty(str){
        return ( str == null || str === "" );
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit
    };

});
