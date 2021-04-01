/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/redirect'],
/*
 * @param {record} record
 * @param {redirect} redirect
 */
function(record, redirect) {
	function afterSubmit(context){
		var employee = context.newRecord;
		var empCode = employee.getValue('custentity_sdr_employee_code');
		var superVisorId = employee.getValue('supervisor');
		
		log.debug('employee', employee);
		log.debug('empCode', empCode);
		log.debug('superVisorId', superVisorId);
		
		if(context.type == context.UserEventType.CREATE){
			var phoneCall = record.create({
				type : record.Type.PHONE_CALL,
				defaultValues : {
					customform : -150
				}
			});
			
			log.debug('phoneCall', phoneCall);
			
			phoneCall.setValue('title', 'Call HR for Benefits');
			phoneCall.setValue('assigned', employee.id);
			phoneCall.save();
			
			var event = record.create({
				type	: record.Type.CALENDAR_EVENT,
				isDynamic : true
			});
			event.setValue('title', 'Welcome meeting with supervisor');
			
			event.selectNewLine({sublistId	: 'attendee'});	
			event.setCurrentSublistValue({
				sublistId	:	'attendee',
				fieldId		: 'attendee',
				value		: employee.id
			});
			event.commitLine({sublistId	: 'attendee'});
			
			
			event.selectNewLine({sublistId	: 'attendee'});	
			
			
			event.setCurrentSublistValue({
				sublistId	:	'attendee',
				fieldId		: 'attendee',
				value		: employee.getValue('supervisor')
			});
			event.commitLine({sublistId	: 'attendee'});
			
			event.save();
		}
		
		redirect.toSuitelet({
			scriptId 		: 'customscript_sdr_sl_update_emp_notes',
			deploymentId 	: 'customdeploy_sdr_sl_update_emp_notes',
			parameters 		: {
				sdr_name 	: employee.getValue('entityid'),
				sdr_notes 	: employee.getValue('comments'),
				sdr_empid 	: employee.id
			}
		});
		   
	}
	return {
	   afterSubmit : afterSubmit
	};
});
