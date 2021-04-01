/**
 *
 * Module Description
 *
 * Version          Date                    Author              Remarks
 * 1.00             31 Aug 2020             kduque              Initial version
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/runtime', './lib/NSUtilvSS2', 'N/ui/serverWidget'],
    /**
     * @param {record} record
     * @param {search} search
     * @param {runtime} runtime
     */
    function(record, search, runtime, NSUtil, serverWidget) {

        var objScript = runtime.getCurrentScript();
        var NWS_REC = objScript.getParameter({
            name: 'custscript_nscs_auto_numbering_nws'
        });

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
            var objRecord = scriptContext.newRecord;
            var stItemID = objRecord.getValue('itemid');
            var objForm = scriptContext.form;
            var stFormattedRevNum;

            log.debug('itemid : sb', stItemID);
            //create virtual field for auto init number to set in beforeSubmit and get in afterSubmit
            var fldItemAutoInitNum = objForm.addField({
                id : 'custpage_ps_item_auto_init_num',
                type : serverWidget.FieldType.TEXT,
                label : 'Virtual Field Auto Init Num'
            });
            fldItemAutoInitNum.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });

            //create virtual field for item revision number to set in beforeSubmit and get in afterSubmit
            var fldItemRevisionNum = objForm.addField({
                id : 'custpage_ps_item_revision_number',
                type : serverWidget.FieldType.TEXT,
                label : 'Virtual Field Revision Num'
            });
            fldItemRevisionNum.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });

            //create virtual field for result.id to set in beforeSumit and get in afterSubmit
            var fldRecordId = objForm.addField({
                id : 'custpage_ps_item_rec_id',
                type : serverWidget.FieldType.TEXT,
                label : 'Virtual Field for Cust Record ID'
            });
            fldRecordId.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
            //get the do not generate field chekcbox
            var fldDoNotGenerate = objForm.getField({
                id : 'custitem_ps_do_not_generate_item_num'
            });

            // checkbox is disabled when editing
            if (scriptContext.type == scriptContext.UserEventType.EDIT){
                fldDoNotGenerate.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.DISABLED
                });
            };

            //create virtual field for boolean fieldCopy to set in beforeSubmit
            var fldCopy = objForm.addField({
                id : 'custpage_ps_bl_copy',
                type : serverWidget.FieldType.TEXT,
                label : 'Virtual Field boolean copy'
            });
            fldCopy.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });

            var stHiddenItemNum = objRecord.getValue({
                fieldId: 'custitem_ps_hidden_item_num'
            });

            // copy item from original item name/number source
            if(scriptContext.type == scriptContext.UserEventType.COPY) {

                objRecord.setValue({
                    fieldId: 'custpage_ps_bl_copy',
                    value: true
                });

                stFormattedRevNum = formatRevisionNum(stHiddenItemNum);

                objRecord.setValue({
                    fieldId: 'custitem_ps_hidden_item_num',
                    value: stFormattedRevNum
                });

                //set updated from formatRevisionNum value to itemid
                objRecord.setValue({
                    fieldId: 'itemid',
                    value: stFormattedRevNum
                });
            } else {
                //if creating new item the value for itemid is set to To be generated
                if (NSUtil.isEmpty(stItemID)) {
                    objRecord.setValue({
                        fieldId: 'itemid',
                        value: 'To be generated'
                    });
                }
            }
        }

        // this function is to format the Copied Item Name/Number from the Hidden Fields, including splitting of revision number.
        function formatRevisionNum(stHiddenItemNum){

            //example : 100-0055-00 or 300-0001-01
            var stSplitRevisionNum = stHiddenItemNum.split("-"); //["100","0055","00" ]
            var stFirstPart = stSplitRevisionNum[0]; // ex. 100
            var stSecondPart = stSplitRevisionNum[1]; // ex. 0055
            var stRevisionNum = stSplitRevisionNum[2]; // ex. 00 or 01

            var intIncRevisionNum = (+stRevisionNum) + 1; // + 1

            intIncRevisionNum = ("00" + intIncRevisionNum).slice(-2); // 01 or 02

            var stCombinedAutoNum = stFirstPart + "-" + stSecondPart + "-" + intIncRevisionNum; //concatenate formatted number and revision

            return stCombinedAutoNum; //return combined number
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

            var objRecord = scriptContext.newRecord;
            var formattedNumber
            var intIncInitNum;

            var stSubsidiary = objRecord.getValue('subsidiary');
            var stDoNotGenerate = objRecord.getValue('custitem_ps_do_not_generate_item_num');

            var bIsCopy = objRecord.getValue('custpage_ps_bl_copy');

            if (scriptContext.type == scriptContext.UserEventType.CREATE &&
                (runtime.executionContext == runtime.ContextType.CSV_IMPORT || runtime.executionContext == runtime.ContextType.USER_INTERFACE)){

                if(!stDoNotGenerate && !bIsCopy) {

                    var subsCustRecordSearch = search.create({
                        type: 'customrecord_ps_item_auto_number',
                        title: 'Auto number custom record',
                        columns: [
                            'custrecord_ps_auto_num_subsidiary',
                            'custrecord_ps_item_auto_init_num',
                            'custrecord_ps_item_revision_number',
                            'custrecord_ps_item_auto_prefix'
                        ],
                        filters: [{
                            name: 'custrecord_ps_auto_num_subsidiary',
                            operator: 'anyof',
                            values: stSubsidiary
                        }]
                    });

                    var intResultCount = subsCustRecordSearch.runPaged().count;

                    if(intResultCount > 0) {
                        subsCustRecordSearch.run().each(function (result) {
                            // Process each result
                            var intItemInitNum = result.getValue({
                                name: 'custrecord_ps_item_auto_init_num'
                            });

                            intIncInitNum = parseInt(intItemInitNum) + 1; //This will increment the init num by 1

                            //set virtual field from intItemInitNum
                            objRecord.setValue({
                                fieldId: 'custpage_ps_item_auto_init_num',
                                value: intIncInitNum
                            });

                            var intRevisionInitNum = result.getValue({
                                name: 'custrecord_ps_item_revision_number'
                            });

                            //set virtual field from intRevisionInitNum
                            objRecord.setValue({
                                fieldId: 'custpage_ps_item_revision_number',
                                value: intRevisionInitNum
                            });

                            var stPrefix = result.getValue({
                                name: 'custrecord_ps_item_auto_prefix'
                            });

                            if (result.id == NWS_REC) {
                                formattedNumber = formatAutoNum(intIncInitNum, intRevisionInitNum);
                            } else {
                                formattedNumber = formatAutoNumWithPrefix(stPrefix, intIncInitNum, intRevisionInitNum);
                            }

                            //set virtual field from result.id
                            objRecord.setValue({
                                fieldId: 'custpage_ps_item_rec_id',
                                value: result.id
                            });
                            //set value for formatted Number
                            objRecord.setValue({
                                fieldId: 'itemid',
                                value: formattedNumber
                            });
                            //set value for HIDDEN FIELD FOR AUTO NUMBER for copy
                            objRecord.setValue({
                                fieldId: 'custitem_ps_hidden_item_num',
                                value: formattedNumber
                            });

                            return true;
                        });
                    } else {
                        objRecord.setValue({
                            fieldId: 'itemid',
                            value: ''
                        });
                    }
                }

                //normal creation of item if stDoNotGenerate checkbox is TRUE
                if(stDoNotGenerate && !bIsCopy) {
                    log.debug('normal creation of item process....');
                    log.debug('stDoNotGenerate', stDoNotGenerate);
                    log.debug('!bIsCopy', !bIsCopy);

                    var itemid = objRecord.getValue('itemid');

                    var formatItemIDForStandardItem = formatAutoNum(itemid, '00');

                    objRecord.setValue({
                        fieldId: 'custitem_ps_hidden_item_num',
                        value: formatItemIDForStandardItem
                    });
                }
            }
        }
        // function for format auto number to assign dash.
        function formatAutoNum(itemInitNum, revisionInitNum){
            var initNum = String(itemInitNum);
            var firstSetNum = initNum.substring(0,3);
            var secondSetNum = initNum.substring(3,7);

            var NWS_Subsidiary = firstSetNum + '-' + secondSetNum + '-' + revisionInitNum;

            return NWS_Subsidiary;
        }
        // function for format auto number with prefix to assign dash.
        function formatAutoNumWithPrefix(stPrefix, itemInitNum, revisionInitNum){
            var initNum = String(itemInitNum);
            var firstSetNum = initNum.substring(0,2);
            var secondSetNum = initNum.substring(2,6);

            var SMTAES_Subsidiary = stPrefix + firstSetNum + '-' + secondSetNum + '-' + revisionInitNum;

            return SMTAES_Subsidiary;
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
        function afterSubmit(scriptContext) {
            var objRecord = scriptContext.newRecord;

            var stItemAutoInitNum = objRecord.getValue({
                fieldId: 'custpage_ps_item_auto_init_num'
            });

            var intItemRecordID = objRecord.getValue({
                fieldId: 'custpage_ps_item_rec_id'
            });

            if (scriptContext.type == scriptContext.UserEventType.CREATE &&
                (runtime.executionContext == runtime.ContextType.CSV_IMPORT || runtime.executionContext == runtime.ContextType.USER_INTERFACE)){

                    if(!NSUtil.isEmpty(intItemRecordID)) {
                    record.submitFields({
                        type: 'customrecord_ps_item_auto_number',
                        id: intItemRecordID,
                        values: {
                            'custrecord_ps_item_auto_init_num': parseInt(stItemAutoInitNum)
                        }
                    });
                }
            }
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });
