// ChatGPT (Translated from ./dynatalk.js): https://chatgpt.com/share/f0aa8e38-2534-4dc6-9341-1f57328e7aae
class PostMessageSpace {
    constructor(aSupervisor, pageType) {
        this.supervisor = aSupervisor;
        this.pageType = pageType;

        if (window._handlePostMessage) {
            window.removeEventListener('message', window._handlePostMessage);
        }

        window._handlePostMessage = (event) => {
            const topic = event.origin;
            const message = event.data;
            console.log('Received message', event.data);
            this.onMessage(topic, message);
        };

        window.addEventListener('message', window._handlePostMessage);
    }

    _publish(topic, payload) {
        if (this.pageType === "parent") {
            const iframe_id = `snap_iframe_${topic}`;
            const iframe = document.getElementById(iframe_id);
            if (iframe) {
                console.log(`${this.pageType} send ${payload}`);
                iframe.contentWindow.postMessage(payload, '*');
            }
        }

        if (this.pageType === "child") {
            window.parent.postMessage(payload, "*");
        }
    }

    onMessage(topic, payload) {
        console.debug(`(space ${this.pageType}) onMessage: ${payload.toString()}`);
        try {
            this.supervisor.onMessage(topic, payload);
        } catch (e) {
            console.error(e);
        }
    }
}

class Agent {
    constructor(agentID, receive_own_broadcasts = false) {
        this._RESPONSE_ACTION_NAME = "[response]";
        this._ERROR_ACTION_NAME = "[error]";
        this.broadcastFlag = "[broadcast]";
        this._promises = {};
        this.availableActions = {};
        this.supervisor = null;
        this.id = agentID || this.constructor.name;
        this.current_message = null;
    }

    setSupervisor(supervisor) {
        this.supervisor = supervisor;
    }

    raiseWith(error) {
        const parent_id = this.current_message.meta.id;
        const to = this.current_message.from;
        const action = this._ERROR_ACTION_NAME;
        const args = { error };
        const message = this.generateMessage(parent_id, to, action, args);
        this.send(message);
    }

    respondWith(value) {
        const parent_id = this.current_message.meta.id;
        const to = this.current_message.from;
        const action = this._RESPONSE_ACTION_NAME;
        const args = { value };
        const message = this.generateMessage(parent_id, to, action, args);
        this.send(message);
    }

    request(agentName, actionName, args) {
        const parentID = null;
        const message = this.generateMessage(parentID, agentName, actionName, args);
        return this._request(message);
    }

    sendTo(agentName, actionName, args) {
        const parentID = null;
        const message = this.generateMessage(parentID, agentName, actionName, args);
        return this.send(message);
    }

    broadcast(actionName, args) {
        this.sendTo(this.broadcastFlag, actionName, args);
    }

    _commit(message) {
        try {
            const action_method = this[message.action.name];
            if (action_method) {
                action_method.bind(this)(...message.action.args);
            } else {
                const error = `Message Not Understood: ${message["to"]}>>${message["action"]["name"]}`;
                console.error(error);
                this.raiseWith(error);
            }
        } catch (e) {
            const error = `${this.id}>>${message['action']['name']} raised exception: ${e}`;
            console.error(error);
            this.raiseWith(error);
        }
    }

    interpret(message) {
        if (this._RESPONSE_ACTION_NAME === message.action.name) {
            console.debug("Handle incoming response", message);
            if (message.action.args.value && message.action.args.value.help) {
                this.availableActions[message.from] = message.action.args.value.help;
            }
            if (this._promises[message.meta.parent_id]) {
                this._promises[message.meta.parent_id].resolve(message.action.args.value);
                delete this._promises[message.meta.parent_id];
            }
        } else if (this._ERROR_ACTION_NAME === message.action.name) {
            console.debug("Handle incoming error", message);
            if (this._promises[message.meta.parent_id]) {
                this._promises[message.meta.parent_id].reject(message.action.args.error);
                delete this._promises[message.meta.parent_id];
            }
        } else {
            this._commit(message);
        }
    }

    _receive(message) {
        console.debug(`(${this.id}) received message`, message);
        this.current_message = message;
        this.interpret(this.current_message);
    }

    _request(message, timeout = 3000) {
        const msg_id = this.send(message);
        return new Promise((resolve, reject) => {
            this._promises[msg_id] = { resolve, reject };
            setTimeout(() => {
                if (this._promises[msg_id]) {
                    console.debug(this._promises);
                    const error = `request(${msg_id}) timeout(${timeout}ms)`;
                    console.error(error);
                    reject(error);
                }
            }, timeout);
        });
    }

    send(message) {
        console.debug(`(${this.id}) sending `, message);
        this.supervisor.send(message);
        return message.meta.id;
    }

    generateMessage(parentID, to, action, args) {
        const message = {
            meta: { id: "" },
            from: "",
            to: "",
            action: { name: "", args: "" }
        };
        if (parentID) {
            message.meta.parent_id = parentID;
        }
        message.meta.id = crypto.randomUUID();
        message.to = to;
        message.from = this.id;
        message.action.name = action;
        message.action.args = args;
        return message;
    }

    ping() {
        this.respondWith("pong");
    }
}

class LivelyDemoAgent extends Agent {
    echo(content) {
        console.log(`echo: ${content}`);
        this.respondWith(content);
    }

    help() {
        const help = {
            "add": {
                "description": "add a and b",
                "args": ["aNumber", "aNumber"]
            },
            "echo": {
                "description": "echo the content",
                "args": ["aString"]
            }
        };
        this.respondWith({ "help": help });
    }

    add(a, b) {
        this.respondWith(a + b);
    }
}

class LivelyEvalAgent extends Agent {
    eval(code) {
        const result = eval(code);
        this.respondWith(result);
    }
}

class Supervisor {
    constructor(pageType) {
        this.broadcastFlag = "[broadcast]";
        this.agents = {};
        this.space = new PostMessageSpace(this, pageType);
    }

    getAgent(agentID) {
        return this.agents[agentID];
    }

    addAgent(agent) {
        agent.setSupervisor(this);
        this.agents[agent.id] = agent;
    }

    parseToJson(payload) {
        try {
            const result = JSON.parse(payload.toString());
            if (this.isValid(result)) {
                return result;
            } else {
                console.log("(Supervisor) bad message");
            }
        } catch (e) {
            alert("Supervisor parseToJson error: " + e);
        }
        return null;
    }

    isValid(message) {
        return ("from" in message && "to" in message && "action" in message);
    }

    onMessage(topic, payload) {
        const message = this.parseToJson(payload);
        if (message) {
            console.debug("(Supervisor) valid message: ", message);
            if (message.to === this.broadcastFlag) {
                for (const agent of Object.values(this.agents)) {
                    agent._receive(message);
                }
            }
            if (message.to in this.agents) {
                this.agents[message.to]._receive(message);
            }
        }
    }

    send(message) {
        const routing_key = message.to;
        this.space._publish(routing_key, JSON.stringify(message));
    }
}

export {Supervisor, Agent, LivelyDemoAgent, LivelyEvalAgent};
// import { Circle, Square } from './shapes.js';