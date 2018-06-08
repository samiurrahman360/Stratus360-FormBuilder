({
	doInit : function(comp, evt, hlp) {
        hlp.getAttachment(comp, hlp);
        
	},
 
 	handleTableCanged: function(comp, evt, hlp){
        comp.set('v.sort', evt.getParam('sort'));
        comp.set('v.orderBy', evt.getParam('orderBy'));
        
        hlp.getAttachment(comp, hlp);
    },
    
	handlePagination : function(comp, evt, hlp){
        comp.set('v.offset', evt.getParam('offset'));
        comp.set('v.pageSize', evt.getParam('pageSize'));
        comp.set('v.length', evt.getParam('length'));
        
        hlp.getAttachment(comp, hlp);
    },
    
    invalidateHeight : function(comp, evt, hlp){
        if(comp.get('v.objectPermission').isAccessible){
        	var tableCmp = comp.find('E_Rep_Attachment_Table_id');
        	tableCmp.invalidateHeight();    
        }
    },
    
    refreshTable : function(comp, evt, hlp){
        var message = '';
        var params = evt.getParam('arguments');
        if(params){
            message = params.message;
        }
        hlp.getAttachment(comp, hlp, message);
    },
    
    handleOnChange : function(comp, event, hlp) {
        //debugger;
		switch(event.getParam('CompId')){
            case comp.get('v.buttonAttachReceiptId') :
                if(comp.get('v.ParentId')){
                    hlp.saveAttachment(comp, event.getParam('payload'));
                }else{
                    hlp.putAttachment(comp, event.getParam('payload'));
                }
                
                break;
        }
	},

    handleValidationFail: function(component, event, helper){
        var params = event.getParam('arguments');
        var message = '';
        if (params) {
            message = params.message || component.get('v.FailureValidationMessage');
        }
        helper.toggleErrorMessage(component, false, message);
    }
})