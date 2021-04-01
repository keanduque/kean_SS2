/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/record', 'N/runtime'],
/**
 * @param {record} record
 * @param {runtime} runtime
 */
function(record, runtime) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(context) {
    	var workflowTotal = runtime.getCurrentScript().getParameter({
    		name : 'custscript_sdr_workflow_total'
    	});
    	
    	var expRep = context.newRecord;
    	var expenseCount = expRep.getLineCount({sublistId : 'expense'});
    	var employeeId = expRep.getValue('entity');
    	var notes = 'Workflow Total : ' + workflowTotal + '\n' +
    				'Expense Count  : ' + expenseCount;
    	
    	
    	var employee = record.load({
    		type : record.Type.EMPLOYEE,
    		id   : employeeId
    	});
    	employee.setValue('comments', notes);
    	employeeId = employee.save();
    	
    	if(!employeeId) {
    		return "failed";
    	}
    	
    	return 'success';
    	
    	
    }

    return {
        onAction : onAction
    };
    
});
