import { Firebot } from "firebot-custom-scripts-types";
import { initRemote } from "./obs-remote";
import { initLogger, logger } from "./logger";
import { setupFrontendListeners } from "./firebot/communicator";
import { ChangeSceneEffectType } from "./firebot/effects/change-scene-effect-type";
import { OBSEventSource } from "./firebot/events/obs-event-source";
import { SceneNameVariable } from "./firebot/variables/scene-name-variable";
import { SceneNameEventFilter } from "./firebot/filters/scene-name-filter";
import { ToggleSourceVisibilityEffectType } from "./firebot/effects/toggle-obs-source-visibility";
import { ToggleSourceFilterEffectType } from "./firebot/effects/toggle-obs-source-filter";
import { StopStreamEffectType } from "./firebot/effects/stop-stream";
import { StartStreamEffectType } from "./firebot/effects/start-stream";
import { ToggleSourceMutedEffectType } from "./firebot/effects/toggle-obs-source-muted";

interface Params {
  ipAddress: string;
  port: number;
  password: string;
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "OBS Control",
      description:
        "Adds several OBS effects, events, and $variables. IMPORTANT: This requires the 'obs-websocket' OBS plugin (by Palakis), version v4.7+ but not v5! Also note: updating any of these settings requires a Firebot restart to take effect.",
      author: "ebiggz",
      version: "1.5.0",
      firebotVersion: "5",
      startupOnly: true,
    };
  },
  getDefaultParameters: () => {
    return {
      ipAddress: {
        type: "string",
        default: "localhost",
        description: "IP Address",
        secondaryDescription:
          "The ip address of the computer running OBS. Use 'localhost' for the same computer.",
      },
      port: {
        type: "number",
        default: 4444,
        description: "Port",
        secondaryDescription:
          "Port the OBS Websocket is running on. Default is 4444.",
      },
      password: {
        type: "password",
        default: "",
        description: "Password",
        secondaryDescription:
          "The password set for the OBS Websocket. Can be left blank if none set.",
      },
    };
  },
  run: ({ parameters, modules }) => {
    initLogger(modules.logger);

    logger.info("Starting OBS Control...");

    const {
      effectManager,
      eventManager,
      frontendCommunicator,
      replaceVariableManager,
      eventFilterManager,
    } = modules;

    initRemote(
      {
        ip: parameters.ipAddress,
        port: parameters.port,
        password: parameters.password,
      },
      {
        eventManager,
      }
    );

    setupFrontendListeners(frontendCommunicator);

    effectManager.registerEffect(ChangeSceneEffectType);
    effectManager.registerEffect(ToggleSourceVisibilityEffectType);
    effectManager.registerEffect(ToggleSourceFilterEffectType);
    effectManager.registerEffect(ToggleSourceMutedEffectType);
    effectManager.registerEffect(StartStreamEffectType);
    effectManager.registerEffect(StopStreamEffectType);

    eventManager.registerEventSource(OBSEventSource);

    eventFilterManager.registerFilter(SceneNameEventFilter);

    replaceVariableManager.registerReplaceVariable(SceneNameVariable);
  },
};

export default script;
