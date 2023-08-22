// Confirmation alert
let choose = confirm('¿Confirma el guardado de la información?');
if (!choose) return;

let $injector = widgetContext.$scope.$injector;
let attributeService = $injector.get(widgetContext.servicesMap.get('attributeService'));

// get all widget's key names
let keys = widgetContext.datasources[0].dataKeys.map(dk => dk.name);
console.log('-----------------\nkeys',keys)

// get SHARED attributes -> 

attributeService.getEntityAttributes(entityId, 'SERVER_SCOPE', keys).subscribe(
    async function(atts){
        console.log(atts);
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        let nowDate = new Date().getTime();
        
        let valuesHash = {};
        for (let keyPkg of atts) valuesHash[keyPkg.key] = keyPkg.value;
        
        valuesHash.ts_id = nowDate;
        let telemetryHashArray = [ {key:'ts',value:nowDate}, {key:'values',value:valuesHash} ];
        console.log('telemetryHashArray',telemetryHashArray)
        
        // save esa mondá, clear form via att deletion, and wait 2 seconds to refresh
        attributeService.saveEntityTimeseries(entityId, 'ANY', telemetryHashArray)
        .subscribe( function(resp){
            console.log('resp',resp);
            //----------------- Clear form by deleting the serv attributes
            // prepare key list as TB want
            keys = keys.map(k => ({'key':k}));
            // delete and then refresh
            attributeService.deleteEntityAttributes(entityId, 'SERVER_SCOPE', keys)
            .subscribe(function () {
                ()=>{setTimeout(widgetContext.updateAliases(),1000)};
            })
        })
    }
);