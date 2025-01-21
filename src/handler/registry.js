const HarnessIntegrationHandler = require("./harness");
const GithubIntegrationHandler = require("./github");

class ToolHandlerRegistry {
    handlers = [];

    constructor() {
        this.handlers.push(new HarnessIntegrationHandler());
        this.handlers.push(new GithubIntegrationHandler());
    }

    getToolHandler() {
        for (let handler of this.handlers) {
            try {
                if (handler.handle()) {
                    return handler;
                }
            } catch (error) {
                console.error(`Error in handler: ${error.message}`);
            }
        }
        return null;
    }
}

module.exports = ToolHandlerRegistry;
