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
		Product2[] productList = createListofProduct(100);
		Product2[] resProductList = ChildCreatorController.formatSObjectList(productList);
		System.assertEquals(productList, resProductList);
	}

	@isTest
	private static void getObjectFieldMapTest() {
		Product2 acc = new Product2(Name = 'Test Product2 '+Math.random());
		Map<String, Map<String,String>> objectFieldMap = ChildCreatorController.getObjectFieldMap(acc);
		System.assert(objectFieldMap.containsKey('Name'));
	}

	@isTest
	private static void getExistingRecordsTest_errors() {
		try {
			ChildCreatorController.getExistingRecords(null, null, null);
			System.assert(false, 'There should be an exception!');
		} catch (Exception e) {
			system.debug('@@Exception on '+e.getStackTraceString()+' : '+e.getMessage());
		}

		String fieldListJSON = '[{"ASdfgasdf":"asdfasdfasgfgasd",sdfgasdf"asdfgasdf":}]';
		Contact item = new Contact(LastName = 'Rossi');
		String[] parameterList = null;

		try {
			ChildCreatorController.getExistingRecords(item, fieldListJSON, parameterList);
			System.assert(false, 'There should be an exception!');
		} catch (Exception e2) {
			system.debug('@@Exception on '+e2.getStackTraceString()+' : '+e2.getMessage());
		}
	}

	@isTest
	private static void getExistingRecordsTest_noParameterList() {
		String fieldListJSON = '[{"name":"FirstName","type":"inputField","required":true},{"name":"LastName","type":"inputField","required":true},{"name":"Phone","type":"inputField","required":true},{"name":"Email","type":"inputField"}]';
		Contact item = new Contact(LastName = 'Rossi');
		String[] parameterList = null;
		Contact[] resContact = ChildCreatorController.getExistingRecords(item, fieldListJSON, parameterList);
		System.assertEquals(0, resContact.size(), 'There should be no existing records!');
	}

	@isTest
	private static void getExistingRecordsTest_withParameterList() {
		String fieldListJSON = '[{"name":"FirstName","type":"inputField","required":true},{"name":"LastName","type":"inputField","required":true},{"name":"Phone","type":"inputField","required":true},{"name":"NOT EXISTING","type":"inputField"}]';
		Contact item = new Contact(LastName = 'Rossi');
		String[] parameterList = new List<String>{'LastName:Rossi','firstname:Mario','asdfasdf:Mario','asdf:23452:23452'};
		Contact[] resContact = ChildCreatorController.getExistingRecords(item, fieldListJSON, parameterList);
		System.assertEquals(0, resContact.size(), 'There should be no existing records!');
	}

	@isTest
	private static void DMLexceptionTest() {
		List<Product2> productList = new List<Product2>();
		Product2 productWithNoName = new Product2();
		productList.add(productWithNoName);
		try {
			ChildCreatorController.saveItems(productList, null);
			System.assert(false, 'There should be an exception! I am trying to insert a Product2 without a Name!');
				
		} catch (Exception e) {
			system.debug('@@Exception on '+e.getStackTraceString()+' : '+e.getMessage());
		}

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