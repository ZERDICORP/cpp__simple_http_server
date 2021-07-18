async function renderer()
{
	let sPath = window.location.pathname;
	let iPageStatusCode = 404;

	if (sPath == ("/"))
		iPageStatusCode = await pageMenu.render();
	else if (sPath == "/about")
		iPageStatusCode = pageAbout.render();
	else if (tools.imprecisePath("/portfolio/[str]/[str]", sPath))
		iPageStatusCode = await pagePortfolio.render();

	switch (iPageStatusCode)
	{
		case (404):
			pageError.render("404", "NOT FOUND");
			break;

		default:
			break;
	}
}

tools.onWindowLoad(renderer);