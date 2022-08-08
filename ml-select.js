
const { spawn } = require('child_process');
const path = require('path');
const CircularBuffer = require('circular-buffer');

module.exports = function (RED) {


    let sharedPythonBuffer = "";
    let child = null;
    let avgVolumeChange = 0;
    let volumeIndex = 0;
    let volumeRingBuffer = new CircularBuffer(50);
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
            console.log("got Data updated SharedBuffer")
        });
        child.stderr.on('data', data => {
            console.log("Error", data.toString())
        });
        child.on('exit', (code) => {

            console.log("We are closing, something broke", code)
            child = null;
        });
    }
    function currentAvg()
    {
        let sum = 0;
        let count = 0;
        for(let i = 1; i < volumeRingBuffer.size(); i++)
        {
            let ind1, vol1 = volumeRingBuffer.get(i-1);
            let ind2, vol2 = volumeRingBuffer.get(i);
    
            let diff = vol2 - vol1;
            if(ind2 < ind1)
            {
                continue;
            }
            else
            {
                sum += diff;
                count++;
            }
        }
        if(sum === 0 || count === 0)
        {
            return avgVolumeChange;
        }
        return sum / count;
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
            if (Data.length != 3) {
                return;
            }
            let detectedClass = Data[0]
            let DOA = Number(Data[2])
            let volume = Number(Data[1])
            volumeRingBuffer.enq([volumeIndex, volume]);
            volumeIndex++;
            
            avgVolumeChange = currentAvg();

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
                case "ssoft":
                    trigger = trigger && (Math.abs(avgVolumeChange) > 10)
                    break;
                case "fsoft":
                case "floud":
                    trigger = trigger && (Math.abs(avgVolumeChange) > 50)
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
