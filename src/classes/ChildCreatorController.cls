public with sharing class ChildCreatorController {

	@AuraEnabled
	public static SObject[] saveItems(SObject[] itemToBeSavedList, SObject[] itemToBeRemovedList){
		system.debug('@@itemToBeSavedList '	+itemToBeSavedList);
		system.debug('@@itemToBeRemovedList '	+itemToBeRemovedList);
		List<SObject> toInsertList = new List<SObject>();
		List<SObject> toUpdateList = new List<SObject>();
		for(SObject item: itemToBeSavedList){
			if(item.Id == null){
				toInsertList.add(item);
			} else {
				toUpdateList.add(item);
			}
		}
		SavePoint savePointBeforeDML = Database.setSavePoint();
        try {
			insert toInsertList;
			update toUpdateList;
			delete itemToBeRemovedList;
        } catch (DmlException e) {
            Database.rollback(savePointBeforeDML);
            String dmlErrorMessage = e.getDmlMessage(0);
            system.debug('@@Exception on '+e.getStackTraceString()+' : '+e.getMessage());
            throw new AuraHandledException('Error while saving the records: '+dmlErrorMessage);
        } catch (Exception e){
            Database.rollback(savePointBeforeDML);
            system.debug('@@Exception on '+e.getStackTraceString()+' : '+e.getMessage());
            throw new AuraHandledException('Error while saving the records: '+e.getMessage());
        }
		return itemToBeSavedList;
	}

	@AuraEnabled
	public static String getObjectName(SObject item){
		return item.getSObjectType().getDescribe().getLabel();
	}

	@AuraEnabled
	public static Map<String, Map<String,String>> getObjectFieldMap(SObject item){
		
		Map<String,Schema.SObjectField> fieldsMap = item.getSObjectType().getDescribe().fields.getMap();
		Map<String, Map<String,String>> objDescribeMap = new Map<String, Map<String,String>>();
		
		for(String key: fieldsMap.keySet()){
			Schema.DescribeFieldResult field = fieldsMap.get(key).getDescribe();
			Map<String, String> fieldDescribeMap = new Map<String, String>();
			fieldDescribeMap.put('label',field.getLabel());
			fieldDescribeMap.put('type', field.getType() +'');
			fieldDescribeMap.put('length', field.getLength() +'');

			if(field.getType() == DisplayType.Picklist){
				List<Schema.PicklistEntry> picklistEntryList = field.getPicklistValues();
				fieldDescribeMap.put('picklistValues', JSON.serialize(picklistEntryList));
			}

			objDescribeMap.put(field.getName(), fieldDescribeMap);
		}

		return objDescribeMap; 
	}

	@AuraEnabled
	public static SObject[] formatSObjectList(SObject[] itemList){
		return itemList;
	}

	@AuraEnabled
	public static SObject[] getExistingRecords(SObject item, String fieldListJSON, String[] parameterList){
		if(item == null || fieldListJSON == null){
			throw new AuraHandledException('Malformed parameters');
		}
		List<fieldWrapper> fieldList = (List<fieldWrapper>) JSON.deserialize(fieldListJSON, List<fieldWrapper>.class);
		if(fieldList == null){
			throw new AuraHandledException('Impossible to retrieve the field list. Contact your system administrator');
		}
		DescribeSObjectResult describeObj = item.getSObjectType().getDescribe();
		Map<String,Schema.SObjectField> fieldsMap = describeObj.fields.getMap();
		String objectName = describeObj.getName();
		String queryFields = 'Id,';
		for(fieldWrapper wrapper: fieldList){
			String fieldName = wrapper.name;
			if(!fieldsMap.containsKey(fieldName)){
				continue;
			}
			queryFields += fieldName+',';
		}

		queryFields = queryFields.removeEnd(',');

		String queryConditions = '';
		if(parameterList == null || parameterList[0] == 'true'){
			parameterList = new List<String>();
		}
		for(String parameter: parameterList){
			String[] condition = parameter.split(':');
			if(condition.size() != 2){
				system.debug('@@Check the parameter List format, it should be like "fieldName:fieldValue": '+parameterList);	
				continue;
			}
			String conditionFieldName = condition[0];
			String conditionValue = condition[1];
			if(!fieldsMap.containsKey(conditionFieldName)){
				system.debug('@@The field '+conditionFieldName+'doesn\'t seems to be a valid field name for '+objectName);
				continue;
			}

			queryConditions += conditionFieldName+'='+'\''+conditionValue+'\''+' AND '; 

		}

		queryConditions = queryConditions.removeEnd(' AND ');
		String queryString = 'SELECT '+queryFields+' FROM '+objectName;
		if(!String.isBlank(queryConditions)){
			queryString += ' WHERE '+queryConditions;
		}

		List<SObject> existingRecordList = Database.query(queryString);
		return existingRecordList;
	}

	public with sharing class fieldWrapper {
		public String name;
		public String type;
		public Boolean required;
	}

}