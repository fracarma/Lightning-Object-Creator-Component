@isTest
private class ChildCreatorControllerTest {
	
	@isTest static void saveItemsTest() {
		Product2[] accountToBeDeletedList = createListofProduct(5);
		insert accountToBeDeletedList;
		
		Product2[] accountToBeSavedList = createListofProduct(5);
		insert accountToBeSavedList;
		accountToBeSavedList.addAll(createListofProduct(5));

		Product2[] returnList = ChildCreatorController.saveItems(accountToBeSavedList,accountToBeDeletedList);
		System.assertEquals(accountToBeSavedList, returnList);
	}
	
	@isTest static void getObjectNameTest() {
		Product2 acc = new Product2(Name = 'Test Product2 '+Math.random());
		String objName = ChildCreatorController.getObjectName(acc);
		System.assertNotEquals(null, objName);
		System.assertNotEquals('', objName);
	}

	@isTest
	private static void formatSObjectListTest() {
		Product2[] accountList = createListofProduct(100);
		ChildCreatorController.formatSObjectList(accountList);
		
	}

	@isTest
	private static void getObjectFieldMapTest() {
		Product2 acc = new Product2(Name = 'Test Product2 '+Math.random());
		Map<String, Map<String,String>> objectFieldMap = ChildCreatorController.getObjectFieldMap(acc);
		System.assert(objectFieldMap.containsKey('Name'));
	}

	public static List<Product2> createListofProduct(Integer n){

		Product2[] accountList = new List<Product2>();
		for(Integer i = 0; i < n; i++) {
			Product2 acc = new Product2(Name = 'Test Product2 '+Math.random());
			accountList.add(acc);
		}

		return accountList;
	}
	
}