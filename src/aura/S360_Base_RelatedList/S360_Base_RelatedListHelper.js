({
	crateListItem : function(component, event, helper){
        var body = component.get('v.body');
        // copy data template and push to data collection and get that refference for our new related list form
        var dataTemplate = {};
        if(component.get('v.FormConfigTemplate').S360_FA__Save_to_Storage__c != true){
            dataTemplate = JSON.parse(JSON.stringify(component.get('v.DataTemplate')));
        }else{
            var tmpDataTemplate = JSON.parse(JSON.stringify(component.get('v.DataTemplate')));
            dataTemplate = {
                'sobjectType' : tmpDataTemplate.sobjectType
            }
        }
        
        debugger;
        // set parent id if available
        if(component.get('v.ParentId') != '' && component.get('v.ParentId') != undefined){
            dataTemplate[component.get('v.RelatedField')] = component.get('v.ParentId');
        }
        
        var index = component.get('v.Data').length;
        component.set('v.Data['+ index +']', dataTemplate);
        var data = component.getReference('v.Data['+ index +']');
        //debugger;
        $A.createComponent(
                'c:S360_FormBuilderMain',
                {
                    "aura:id": 'form',
                    "formConfigName": component.get('v.FormName'),
                    "FormConfig": component.get('v.FormConfigTemplate'),
                    "FieldInfo": component.get('v.FieldInfoTemplate'),
                    "Data": data,
                    "ObjectInfo": component.get('v.ObjectInfoTemplate'),
                    "lockLogic": component.get('v.lockLogicTemplate'),
                    "autoSaveInterval": component.get('v.autoSaveIntervalTemplate'),
                    "autoSaveOn": component.get('v.autoSaveOnTemplate')
                },
                function(newComponent, status, errorMessage){
                    if(status){
                    	body.push(newComponent);
                        component.set('v.body', body);
                    }
                });
    },
    
    /**
     * get related data and construct that form based on related data
     */
    getAndCustrunctRelatedData: function(component){
        component.set('v.IsReady', false);
        var self = this;
        
        // if related field not set up properly, exit this process
        if(component.get('v.FieldInfoTemplate')[component.get('v.RelatedField')] == undefined ||
          	component.get('v.FieldInfoTemplate')[component.get('v.RelatedField')] == ''){
            component.set('v.IsReady', true);
        	return;    
        }
        
        // if parent id empty, exit this process
        if(component.get('v.ParentId') == undefined || component.get('v.ParentId') == ''){
            component.set('v.IsReady', true);
            return;
        }

        debugger;

        // if the template will save the data to big object
        var fields = '';
        var sobject = '';
        var cWhere = '';
        if(component.get('v.FormConfigTemplate').S360_FA__Save_to_Storage__c == true){
            fields = ' Id, S360_FA__Record__c ';
        }else{
            var fields = component.get('v.FormConfigTemplate').S360_FA__Field__c;
        }

        sobject = component.get('v.FormConfigTemplate').S360_FA__Primary_Object__c;
        cWhere = component.get('v.FieldInfoTemplate')[component.get('v.RelatedField')].relationshipApi + '.Id = \'' 
                            + component.get('v.ParentId') + '\'';
        
        var action = component.get('c.getRelatedData');
        action.setParams({
            "fields" : fields,
            "sFrom" : sobject,
            "cWhere" : cWhere
        });
        action.setCallback(this, function(response){
            if(component.isValid() && response.getState() == 'SUCCESS'){
                var res = response.getReturnValue();
                //debugger;
                if(res.length > 0){
                    debugger;
                    res.forEach(function(record){

                        if(component.get('v.FormConfigTemplate').S360_FA__Save_to_Storage__c == true){
                            var tmpDataTemplate = JSON.parse(JSON.stringify(component.get('v.DataTemplate')));
                            var tmpRecord = JSON.parse(record.S360_FA__Record__c);
                            tmpRecord.Id = record.Id
                            tmpRecord.sobjectType = tmpDataTemplate.sobjectType;

                            record = tmpRecord;
                        }
                        // populate the dat to field
                        record = self.populateData(component.get('v.FormConfigTemplate'), record);
                        debugger;
                        var body = component.get('v.body');
                        var index = component.get('v.Data').length;
                        
                        component.set('v.Data['+ index +']', record);
                        var data = component.getReference('v.Data['+ index +']');
                        
                        $A.createComponent(
                            'c:S360_FormBuilderMain',
                            {
                                "aura:id": 'form',
                                "formConfigName": component.get('v.FormName'),
                                "Data": data,
                                "FormConfig": component.get('v.FormConfigTemplate'),
                                "FieldInfo": component.get('v.FieldInfoTemplate'),
                                "ObjectInfo": component.get('v.ObjectInfoTemplate'),
                                "lockLogic": component.get('v.lockLogicTemplate'),
                                "autoSaveInterval": component.get('v.autoSaveIntervalTemplate'),
                                "autoSaveOn": component.get('v.autoSaveOnTemplate')
                            },
                            function(newComponent, status, errorMessage){
                                if(status){
                                    body.push(newComponent);
                                    component.set('v.body', body);
                                }
                            }); 
                    });
                }
                
                // remove loading
                component.set('v.IsReady', true);
            }
        });
        $A.enqueueAction(action);
    },
    
    deleteRecordHelper: function(component, event, helper){
        var self = this;
        var index = event.getParam("Payload");
        var data = component.get('v.Data');
        var body = component.get('v.body');
        
        var action= component.get('c.deleteRecords');
        action.setParams({
            "obj" : data[index].sobjectType,
            "lid" : "'" + data[index].Id + "'"
        });
        action.setCallback(this, function(response){
            if(component.isValid() && response.getState() == 'SUCCESS'){
                var res = response.getReturnValue();
                if(res.status == true){
                    // remove data from v.Data and component
                    body.splice(index, 1);
                    data.splice(index, 1);
                    
                    component.set('v.body', body);
                    component.set('v.Data', data);
                    
                    helper.showToast(component, 'success', 'Success delete record');
                }else{
                    helper.showToast(component, 'error', 'Failed delete record : ' + res.message);
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    populateData : function(formConfig, data){
        var item = {
            'sobjectType': formConfig.S360_FA__Primary_Object__c,
            'Id': (data != undefined && data['Id']) ? data['Id'] : undefined,
            'Name': (data != undefined && data['Name']) ? data['Name'] : undefined,
        };
        if(formConfig.S360_FA__Field__c && formConfig.S360_FA__Save_to_Storage__c == false){
            formConfig.S360_FA__Field__c.split(',').forEach(function(field){
                if(data != undefined && data[field]){
                    item[field] = data[field];
                }else{
                    item[field] = '';
                }
                
            });    
        }else{
            item = data || {};
        }
        
        return item;
    },
    
    
    showToast: function(comp, type, message){
        comp.set('v.TextMessage', message);
        comp.set('v.ToastType', type);
        var toastValue = comp.get('v.showToast');
        if(toastValue)
        {
            comp.set('v.showToast',false);
        }else
        {
            comp.set('v.showToast',true);
        }
		//debugger;
    },
})