/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/https', 'N/url'],
/**
 * @param {runtime} runtime
 * @param {https} https
 * @param {url} url
 */
function(runtime, https, url) {

    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
	
    var objScript = runtime.getCurrentScript();

    var DEFAULT_EMP_CODE = objScript.getParameter({
        name: 'custscript_sdr_default_emp_code'
    });
    
    function pageInit(context) {
    	var employee = context.currentRecord;
    	var sublistID = 'recmachcustrecord_sdr_perf_subordinate';
    	
    	var perfRevCount = employee.getLineCount({
    		sublistId	: sublistID
    	});
    	
    	var notes = 'This employee has ' + perfRevCount + ' performance reviews \n';
    	
    	var fRatingCount = 0;
    	
    	for(var i=0; i<perfRevCount; i++){
    		var ratingCode = employee.getSublistValue({
    			sublistId 	: sublistID,
    			fieldId		: 'custrecord_sdr_perf_rating_code',
    			line		: i
    		});
    		
    		if(ratingCode == 'F'){
    			fRatingCount += 1;
    		}
    	}
		notes += 'This employee has ' + fRatingCount + ' F-rated reviews';
		
		//alert(notes);
		
//		var empCode = employee.getValue('custentity_sdr_employee_code');
//		log.debug('outerempCode', empCode);
//		
//		log.debug('DEFAULT_EMP_CODE', DEFAULT_EMP_CODE);
//		
//		if(!empCode){
//			log.debug('empCode', empCode);
//			
//			var defaultEmpCode = runtime.getCurrentScript().getParameter({
//				name : 'custscript_sdr_default_emp_code'
//			});
//			
//			employee.setValue('custentity_sdr_employee_code', defaultEmpCode);	
//		}
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
    	
    	log.debug('scriptContext', scriptContext);
        var objRecord = scriptContext.currentRecord;

        if(scriptContext.fieldId == 'phone'){

            var fax = objRecord.getValue('fax');
            log.debug('phone', phone);


            if(!fax){
      		var phone = objRecord.getValue('phone');
                objRecord.setValue({
                    fieldId : 'fax',
                    value : phone
                });
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

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(context) {
    	var employee = context.currentRecord;
    	var sublistID = 'recmachcustrecord_sdr_perf_subordinate';
    	
    	if(context.sublistId == sublistID){
    		var getReviewType = employee.getCurrentSublistValue({
    			sublistId	: sublistID,
    			fieldId		: 'custrecord_sdr_perf_review_type'
    		});
    		
    		if(!getReviewType){
    			employee.setCurrentSublistValue({
    				sublistId	: sublistID,
    				fieldId		: 'custrecord_sdr_perf_review_type',
    				value		: 1
    			});
    		}
    	}
    	
    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {
    	var employee = scriptContext.currentRecord;
    	
    	if(scriptContext.fieldId == 'custentity_sdr_employee_code'){
    		var empCode = employee.getValue('custentity_sdr_employee_code');
    		
    		if(empCode == 'x'){
    			alert('Invalid Employee Code value! Please Try Again!');
        		return false;
        	}
    	}
    	return true;
    	
    	
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
    	var employee = context.currentRecord;
    	var sublistID = 'recmachcustrecord_sdr_perf_subordinate';
    	
    	if(context.sublistId == sublistID){
    		var increaseAmount = employee.getCurrentSublistValue({
    			sublistId	: sublistID,
    			fieldId		: 'custrecord_sdr_perf_sal_incr_amt'
    		});
    		
    		if(increaseAmount > 5000){
    			alert('Salary increase amount cannot be greater than 5000');
    			
    			return false;
    		}
    	}
    	
    	return true;
    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
    	var objRecord = scriptContext.currentRecord;
    	var empCode = objRecord.getValue("custentity_sdr_employee_code");
    	
    	var response = https.get({
    		url : '/app/site/hosting/restlet.nl?script=206&deploy=1' + '&sdr_emp_code=' + empCode
    	});
    	
    	if (response.body == 'invalid'){
    		alert('Invalid Employee Code value! Please Try Again!');
    		return false;
    	}
    	return true;
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
//        postSourcing: postSourcing,
//        sublistChanged: sublistChanged,
        lineInit: lineInit,
        //validateField: validateField,
        validateLine: validateLine,
//        validateInsert: validateInsert,
//        validateDelete: validateDelete,
        saveRecord: saveRecord
    };

});
