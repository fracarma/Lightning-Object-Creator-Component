# Lightning Object Creator Component

<a href="https://githubsfdeploy.herokuapp.com">
  <img alt="Deploy to Salesforce" src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>

Salesforce doesn't provide an easy way to create multiple records directly from a Visualforce page. We needed an easy way to create child records from the parent page, selecting some fields the user needs to fill in.

So, the *ChildCreatorComponent* (the name is out to date!) was written basically to fill this needing. It is written with the Lightning Framework, so as possible to use this component in Visualforce pages but also to create specific components for Lightning App Builder.

A picture of the component working is here:

![Child Creator Component Working!](https://cloud.githubusercontent.com/assets/12348998/19725619/ee604368-9b86-11e6-8ade-9efc41f097f7.PNG)

## Prerequisites

1. Upload as a Global Resource the Salesforce Design System that you can generate [here](https://www.lightningdesignsystem.com/downloads/). During the process, if asked, the namespace has to be *"sdls"*. Anyway, in the repository is present the necessary static resource [here](src/staticresources/SLDS212.resource).
1. Enable **My Domain** on your org (that is necessary for use the Lightning App Builder) [resource](https://trailhead.salesforce.com/en/project/slds-lightning-components-workshop/slds-lc-1).

## Usage

The main component *ChildCreatorComponent* is intended to be used directly in Visualforce pages. To use it in the Lightning App Builder, we will create another component that will fit our request (an example, a component to create Contacts on Account Record pages, is present in the repository [here](src/aura/ContactsCustomCreator)).

## c:ChildCreatorComponent

### Attributes

|             			Name            |         Type      |                                Description                                  |
|---------------------------------------|-------------------|-----------------------------------------------------------------------------|
|          *obj* (*Required*)           |		SObject     |The standard or custom object to be used in the component to create the records. It has to be written in JSON format|
|          *fieldList* (*Required*)     |		Object[]    |The list of the fields we want to display on the component|
|          *additionalFields*           |		String      |A String-format list of field names and relative values. Needed only when the component is used in the Lightning App Builder|
|          *saveButton*                 |		Boolean     |Display a *save* button. Default is *false*|
|          *message*             	    |		Boolean     |Display a message dialog box. Intended for debug operations. Default is *false*|
|          *max*      	         	    |		Integer     |Maximum number of records a user can create. If not specified, a maximyum number is not set|
|          *columns*      	       	    |		Integer     |Number of record boxes to be displayed in the component in desktop version. On mobile, the value is set to 1. Default value is 1|
|          *createRecordOnLoad*      	|		Boolean     |Create a record on component loading. Default is *true*|

#### fieldList

|             			Name            |         Type      |                                Description                                  |
|---------------------------------------|-------------------|-----------------------------------------------------------------------------|
|          *name* (*Required*)           |		String     |API name of the field|
|          *type* (*Required*)		     |		String 	    |'inputField' or 'outputField'|
|          *required*		           |		Boolean      |If *true*, the field is required and a *save* operation is not allowed|


#### Example:

```
<c:ChildCreatorComponent 	obj="{
                            			sobjectType : 'Contact',
		                            	LastName : 'Rossi',
		                            	FirstName : 'Mario'
                    				}"
    
                    			additionalFields="{!'AccountId:'+v.recordId}"
							
                              	fieldList="[
                    				{name : 'FirstName' ,       type : 'inputField', required : true},
	                            	{name : 'LastName' ,       type : 'inputField', required : true},
	                            	{name : 'Phone' ,        type : 'inputField', required : true},
	                            	{name : 'Email' ,        type : 'inputField'}
	                        	]"
            				

								max="2"
								columns="2"
								saveButton="{!v.saveButton}"
								message="{!v.message}"
								createRecordOnLoad="{!true}"
/>
```

### Methods

#### save(*Object* fieldList)

Commit the records to the database. Support Insert, Update and Delete. It is possible to define new values for all the record fields (e.g. After inserting the parent, write the id to the child records).

#### fireReturnItemListEvent()

Fire the *ReturnItemListEvent* (see [here](src/aura/returnItemList/returnItemList.evt)). This Application-Level event carries the list of the records at the moment of firing. It could be used everytime we need the record list in the parent Visualforce page (for custom field validation, for example).

#### validateFields()

Force the component to validate the fields.

## Use the component in VisualForce Pages

To insert the component, is necessary to create the component via Javascript. So, create a div in the page with the id *childCreatorComponent* and insert this script into the page:

```
<script>
	
$Lightning.use("c:ChildCreatorApp", function() {
                  $Lightning.createComponent("c:childCreatorComponent",
                    { 
                        obj : {
                            sobjectType : "Contact",
                        },

                        fieldList : [
                            {name : "FirstName" ,       type : "inputField", required : true},
                            {name : "LastName" ,       type : "inputField", required : true },
                        ],
                    },
                  "childCreatorComponent",
                  function(cmp) {
                    //Do something

                  });
                });
</script>
```
That's it! Your component should be visible on your page.

We can also register some events on component intialization, or save the component as a variable to call the methods later:

```
 <script>

            
            var contactComponent = {};

            initializeComponent();

            var callRedirectToViewPage = function(event){
                console.log("savedItemListEvent handled!");
                if(event.getParam("isExternalRequest")){
                    redirectToViewPage();
                }
            }

            var handleReturnItemList = function(event){
                contactComponent.validateFields();
            }

            function saveWebUsersComponent(){
                if(!"{!Account.Id}"){
                    console.log("ERROR: The Account has not been created");
                    return null;
                }
                //Take care, this function, to correct read the Account.Id field (if it changes), should be placed in a rerender section
                contactComponent.save({"AccountId" : "{!Account.Id}"});
            }

			function initializeComponent(){
			$Lightning.use("c:ChildCreatorApp", function() {
                  $Lightning.createComponent("c:childCreatorComponent",
                    { 
                        obj : {
                            sobjectType : "Contact",
                        },

                        fieldList : [
                            {name : "FirstName" ,       type : "inputField", required : true},
                            {name : "LastName" ,       type : "inputField", required : true },
                        ],
                    },
                  "childCreatorComponent",
                  function(cmp) {
						$A.eventService.addHandler({"name" : "savedItemListEvent",  "event": "c:savedItemList", "handler" : callRedirectToViewPage});     
                    	$A.eventService.addHandler({"name" : "returnItemListEvent",  "event": "c:returnItemList", "handler" : handleReturnItemList});     
                    	contactComponent = cmp;
                  });
                });
			}
</script>
```

## Use the component in Lightning App Builder

To see the component in the list of the available custom components in the Lightning App Builder, we need to create a *middlestage* component. An [example](src/aura/ContactsCustomCreator) is present in the repository.
Be sure to accomplish all the requisites described in this resource: https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/components_config_for_app_builder.htm

## TODO

1. Add the possibility to load existing records on loading (DONE)
1. Update this README