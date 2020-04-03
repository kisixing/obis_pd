import React from "react";
import {Router,Switch,Route} from "react-router-dom";

const r = require("history").createBrowserHistory;

const history = r();
/*history.listen(
	(location, action) => 0 &&
		history.push({
			pathname: "/",
			search: "?asd=23",
			state: { some: "state" },
		})
);*/
export default function(routers){
	return (
		<Router history={history}>
			<Switch>
				{routers.map((r,i) => <Route key={`route-${i}`} {...r}></Route>)}
			</Switch>
		</Router>
	)
};
