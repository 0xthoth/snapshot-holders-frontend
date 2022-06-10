import ReactGA from "react-ga";

import { Environment } from "./environment";

const GA_API_KEY = Environment.getGoogleAnalyticsApiKey();

type Category = "App";

interface TrackGAEventOptions extends ReactGA.EventArgs {
  category: Category;
}

export const trackGAEvent = (event: TrackGAEventOptions) => {
  try {
    // Universal GA (using react-ga)
    if (GA_API_KEY && ReactGA) {
      ReactGA.event(event);
    }
  } catch (error) {
    console.error("trackGAEvent", error);
  }
};
