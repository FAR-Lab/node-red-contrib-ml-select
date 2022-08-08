
const { spawn } = require('child_process');
const path = require('path');


module.exports = function (RED) {


    let sharedPythonBuffer = "";
    let child = null;
   
    function StartChild() {
        if (child != null && child?.exitCode
            == null) {
            console.log("Killing the current child.")
            child.kill()
            child = null;
        }

        child = spawn('python3', [path.join(__dirname,'/AudioDetectionDeamon/AudioDeamon.py')]); // ToDo: this is VERY ugly needs to be changed 

        child.stdout.on('data', data => {
            sharedPythonBuffer = data.toString();
            //console.log("got Data updated SharedBuffer")
        });
        child.stderr.on('data', data => {
            console.log("Error", data.toString())
        });
        child.on('exit', (code) => {

            console.log("We are closing, something broke", code)
            child = null;
        });
    }
    
    StartChild();

    function MlSelect(config) {

        RED.nodes.createNode(this, config);
        var node = this;
        let metadata = JSON.parse(config.metadataJSON);
        let model = JSON.parse(config.modelJSON);
        let labels = metadata.wordLabels;
        
        function ProcessData() {
            let trigger = false;
            let files = config.files;
            Data = sharedPythonBuffer.split(',');
            if (Data.length != 4) {
                return;
            }
            let detectedClass = Data[0]
            let DOA = Number(Data[2])
            let volume = Number(Data[1])
            let volumechange = Number(Data[3])
            
           

            switch (config.volume) {
                case "vloud":
                    if (volume > 3000) {
                        trigger = true;
                    } else {
                        trigger = false;
                    }
                    break;
                case "loud":
                    if (volume > 1500 && volume <= 3000) {
                        trigger = true;
                    } else {
                        trigger = false;
                    }
                    break;

                case "soft":
                    if (volume > 500 && volume <= 1500) {
                        trigger = true;
                    } else {
                        trigger = false;
                    }
                    break;
                case "vsoft":
                    if (volume <= 500) {
                        trigger = true;
                    } else {
                        trigger = false;
                    }
                    break;
                case "any":
                    trigger = true;
                    break;

                default:
                    break;
            }
            trigger = trigger && (config.class === detectedClass)
            
            switch(config.volume_change)
            {
                case "sloud":
                    trigger = trigger && (volumechange > 10)
                    break
                case "ssoft":
                    trigger = trigger && (volumechange < -10)
                    break;
                case "fsoft":
                    trigger = trigger && (volumechange < -50)
                case "floud":
                    trigger = trigger && (volumechange > 50)
                    break;
                case "any":
                    trigger = trigger && true
                    break;
            }
            let doaCheck = (((config.left === "true") && (DOA <= 180 && DOA >= 0)) || 
            ((config.right === "true") && (DOA <= 0 && DOA >= 180)) ||
            ((config.front === "true") && (DOA <= 60 && DOA >= 300)) ||
            ((config.back === "true") && (DOA <= 225 && DOA >= 135)));
            
            trigger = trigger && doaCheck;

            if (trigger) {
                node.send({ payload: 'go' });
            } else {

            }

    


        node.on('input', function (msg) {
            if (child == null || (child != null && child.exitCode != null)) {
                node.warn("Starting a new child as it was NULL or had died!");

                StartChild();
            } else {
                ProcessData();
            }
        });




        let interfavelHandle = setInterval(() => {



            ProcessData();

        }, config.retrigger_window * 1000);

        node.on('close', function () {
            clearInterval(interfavelHandle)
            config.files = []
            volumeIndex = 0;
            
        });


    }}



    RED.nodes.registerType("ml-select", MlSelect, {
        settings: {
            mlSelect: {
                value: "red",
                exportable: true
            }
        }
    });
}
