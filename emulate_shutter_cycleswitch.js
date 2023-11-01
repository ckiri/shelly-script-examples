 /**
 * @copyright shelly-tools contributors
 * @license   GNU Affero General Public License (https://www.gnu.org/licenses/agpl-3.0.de.html)
 * @authors   https://github.com/shelly-tools/shelly-script-examples/graphs/contributors
 *
 * This script can emulate a cycle switch for a remote Shelly 2.5 in roller shutter mode
 * with a Shelly Plus device.
 * Once the button is pushed it checks the former direction and sends a open, stop or close
 * command to the remote Shelly 2.5.
 */

// CONFIG START
// this is the remote shelly which we want to control.
// Input is the number of the switch

// Die einzelne CONFIG habe ich jetzt in ein Array abgeändert. Das Array
// hat 2 Elemente. Einmal den jeweiligen Taster (input) sowie den jeweiligen
// Shelly der gesteuert werden soll (ip). Eine CONFIG bezieht sich, wenn ich es
// richtig verstanden habe, auf einen Taster. Also mit Taster 1 steuert man Shelly X
// und mit Taster 2 steuert man Shelly Y.
let CONFIG = [];
CONFIG[0] = {
    ip: '192.168.0.2xx',    // IP-Adresse des 1. Shellys angeben
    input: 0,               // Taster Nummer 1?
    btnevent: 'single_push'
};
CONFIG[1] = {
    ip: '192.168.0.2xx',    // IP-Adresse des 2. Shellys angeben
    input: 1,               // Taster Nummer 2?
    btnevent: 'single_push'
};
// CONFIG END

// no need to change anything below this line..

// add an evenHandler for button type input and single push events
Shelly.addEventHandler(
    function (event, user_data) {
        //print(JSON.stringify(event));
        if (typeof event.info.event !== 'undefined') {
            for (let i = 0; i < CONFIG.length; i++){    // Gehe durch jedes Element des CONFIG Arrays
                if (event.info.id === CONFIG[i].input && event.info.event === CONFIG[i].btnevent) {
                    getCurrentState(CONFIG[i].ip, i);   // IP-Adresse und Index des CONFIG-Elements an 'getCurrentState'-Funktion übergeben
                } else {
                    return true;
                }
            }
        } else {
            return true;
        }
    },
);

// query a remote shelly and determine if next step is open, stop or close
function getCurrentState(ip, config_no) {   // Die übergebene IP-Addresse und Index des CONFIG-Elements
    Shelly.call(
        "http.get", {
            url: 'http://' + ip + '/roller/0'
        },
        function (res, error_code, error_message, ud) {
            if (res.code === 200) {
                let st = JSON.parse(res.body);
                if (st.state === 'stop' && st.last_direction === 'close') { // Wenn der Status des Shellys 'Halten' ist und die letzte Richtung 'Zu' war,
                    controlShutter(CONFIG[config_no].ip, 'open');           // dann wird der Rolladen geöffnet
                    print("open shutter");
                } else if (st.state === 'stop' && st.last_direction === 'open') {   // Wenn der Status des Shellys 'Halten' ist und die letzte Richtung 'Auf' war,
                    controlShutter(CONFIG[config_no].ip, 'close');                  // dann wird der Rolladen geschlossen
                    print("close shutter");
                } else {
                    controlShutter(CONFIG[config_no].ip, 'stop');
                    print("stop shutter");
                }
            }
        },
        null
    );
};

// send shutter command
function controlShutter(ip, command) {
    Shelly.call(
        "http.get", {
            url: 'http://' + ip + '/roller/0?go=' + command
        },
        function (response, error_code, error_message, ud) {

        },
        null
    );
};
