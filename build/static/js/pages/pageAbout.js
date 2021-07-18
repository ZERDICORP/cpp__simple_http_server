let pageAbout = {
	sTitle: "ZERDICORP | About",
	sCssPrefix: "about__",
	render()
	{
		tools.setPageTitle(this.sTitle);
		tools.setHtml("wrapper", `
			<div class="title_container">
				<h1 class="title">about</h1>
			</div>
			<div class="content ${this.sCssPrefix}content">
				<h3>
					Who is ZERDICORP?
				</h3>
				<p>
					Just a programmer. He can create a desktop applications, games, science simulations, network soft and web apps.
				</p>
				<h3>
					Why should you choose him?
				</h3>
				<p>
					It's obvious: he has 5 years of experience, knowledge in higher mathematics and an excellent portfolio, in which you will definitely find confirmation of what I said.
				</p>
				<p>
					<i>«the rest is up to you»</i>
				</p>
			</div>
			<div class="button back">
				menu
			</div>
		`);
		
		tools.onClick("back", () => tools.redirectWithoutReload("/", renderer));

		return 200;
	}
};