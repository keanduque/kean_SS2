/**
 *
 * Module Description
 *
 * Version        	Date               		Author         		Remarks
 * 1.00            	04 Sept 2020       		kduque           	Initial version
 * 1.01             12 Oct 2020             kduque              add pageInit for initialize for checking CLIENT_DEPT value on edit
 * 1.02             29 Oct 2020             kduque              add checking for CLIENT_DEPT if null or empty
 *
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 */
define(['N/record', 'N/search', 'N/ui/dialog', './lib/NSUtilvSS2'],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     */
    function(record,  search, dialog, NSUtil) {

        var CLIENT_DEPT;

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {
            var currentRecord = scriptContext.currentRecord;

            if (scriptContext.mode == 'edit') {

                log.debug('pageInit scriptContext.mode', scriptContext.mode);

                var clientId = currentRecord.getValue({
                    fieldId: 'partner'
                });

                log.debug('pageInit clientId', clientId);

                if (!isNullOrEmpty(clientId)){
                    var deptLookUp = search.lookupFields({
                        type: 'partner',
                        id: clientId,
                        columns: ['department']
                    });

                    log.debug('pageInit deptLookUp.department', deptLookUp.department);
                    log.debug('pageInit deptLookUp.department[0]', deptLookUp.department[0]);

                    var dept = deptLookUp.department[0]; // department

                    if(!isNullOrEmpty(dept)){
                        var deptValue = dept.value; //department value

                        CLIENT_DEPT = deptValue; // pass department value to global variable CLIENT_DEPT

                        log.debug('pageInit : CLIENT_DEPT', CLIENT_DEPT);
                    }
                }

            }
        }
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
        function fieldChanged(scriptContext) {
            var currentRecord = scriptContext.currentRecord;
            var fieldId = scriptContext.fieldId;

            if(fieldId == 'partner') {

                try{
                    var clientId = currentRecord.getValue({
                        fieldId: 'partner'
                    });

                    log.debug('fieldChange : clientId', clientId);

                    if (!isNullOrEmpty(clientId)){
                        var deptLookUp = search.lookupFields({
                            type: 'partner',
                            id: clientId,
                            columns: ['department']
                        });

                        var dept = deptLookUp.department[0]; // department

                        if(!isNullOrEmpty(dept)){
                            var deptValue = dept.value; //department value

                            CLIENT_DEPT = deptValue; // pass department value to global variable CLIENT_DEPT
                        }
                    }
                }catch(ex){
                    var stError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' : ex.toString();
                    log.error('Error: fieldChanged()', stError);
                }
            }

        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {
            var currentRecord = scriptContext.currentRecord;
            var sublistName = scriptContext.sublistId;
            var fieldId = scriptContext.fieldId;

            if (sublistName === 'item' && fieldId === 'item') {

                log.debug('postSourcing CLIENT_DEPT', CLIENT_DEPT);

                if(!NSUtil.isEmpty(CLIENT_DEPT)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'department',
                        value: CLIENT_DEPT
                    });
                }
            }
        }
        function isNullOrEmpty(str){
            return ( str == null || str === "" );
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            postSourcing: postSourcing
        };
    });
