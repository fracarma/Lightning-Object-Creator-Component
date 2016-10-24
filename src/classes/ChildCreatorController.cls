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
		insert toInsertList;
		update toUpdateList;
		delete itemToBeRemovedList;
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
}