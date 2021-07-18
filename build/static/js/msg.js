class MSG
{
	constructor()
	{
		this.div = document.createElement("div");
		document.body.appendChild(this.div);
		this.div.classList.add("messageBox");
		this.div.classList.add("messageBoxHidden");
		this.div.classList.add("messageBoxTransition");

		this.isShow = false;
	}

	show(text)
	{
		if (!this.isShow)
		{
			this.isShow = true;
			this.div.innerHTML = text;
			this.div.classList.remove("messageBoxHidden");
			setTimeout(() => {
				this.div.classList.add("messageBoxHidden");
				setTimeout(() => {
					this.isShow = false;
				}, 200);
			}, 2000);
		}
	}
}