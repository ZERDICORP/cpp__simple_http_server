let pagePortfolio = {
	bDownloadProgress: false,
	topics: [],
	sCurrentTopicUri: "",
	sCurrentTopicItemUri: "",
	iCurrentImageIndex: 0,
	sBasePath: "/portfolio",
	sTitle: "ZERDICORP | Portfolio",
	sCssPrefix: "portfolio__",
	baseHtml()
	{
		return `
			<div>
				<div class="title_container">
					<h1 class="title">portfolio</h1>
					<h3 class="subtitle">topics</h3>
				</div>
			</div>
			<div class="content ${this.sCssPrefix}content"></div>
			<div class="button back">
				menu
			</div>
		`;
	},
	toggleButtonsState(sState)
	{
		if (sState == "disable")
		{
			tools.addClass(this.sCssPrefix + "control_left", this.sCssPrefix + "disabled_when_progress_doing");
			tools.addClass(this.sCssPrefix + "control_right", this.sCssPrefix + "disabled_when_progress_doing");
			tools.addClass("back", this.sCssPrefix + "disabled_when_progress_doing");
		}
		else if ("enable")
		{
			if (!this.bDownloadProgress && this.state.items.currentItem[0].images.iLoad != 1)
			{
				tools.removeClass(this.sCssPrefix + "control_left", this.sCssPrefix + "disabled_when_progress_doing");
				tools.removeClass(this.sCssPrefix + "control_right", this.sCssPrefix + "disabled_when_progress_doing");
				tools.removeClass("back", this.sCssPrefix + "disabled_when_progress_doing");
			}
		}

	},
	state: {
		topics: {
			bNeedToUpdate: true,
			beforeRerender(parent)
			{
				this.bNeedToUpdate = true;
				renderer();
			},
			ifNeedToUpdateThenUpdate(parent)
			{
				if (this.bNeedToUpdate)
				{
					this.update(parent);
					this.bNeedToUpdate = false;
				}
			},
			update(parent)
			{
				tools.setPageTitle(parent.sTitle);
				tools.setHtml("wrapper", parent.baseHtml());
				tools.setHtml("content", `
					<div class="${parent.sCssPrefix}topics">
						${parent.topics.map((topic, index) => `
							<div class="${parent.sCssPrefix}topic ${parent.sCssPrefix}topic${index}">
								<span>${topic.name}</span>
							</div>
						`).join("")}
					</div>
				`);

				for (let i = 0; i < parent.topics.length; i++)
				{
					tools.addChild(`${parent.sCssPrefix}topic${i}`, parent.topics[i].icon);
					tools.onClick(`${parent.sCssPrefix}topic${i}`, () => tools.redirectWithoutReload(
							`/portfolio/${tools.toUriStandard(parent.topics[i].name)}/${tools.toUriStandard(parent.topics[i].items[0].title)}`, 
						() => this.beforeRerender(parent)));
				}

				tools.onClick("back", () => tools.redirectWithoutReload("/", () => this.beforeRerender(parent)));
			}
		},
		items: {
			bNeedToUpdate: true,
			currentTopic: null,
			currentItem: null,
			beforeRerender(parent)
			{
				this.bNeedToUpdate = true;
				parent.state.images.bNeedToUpdate = true;
				parent.state.images.bViewScreenshots = false;
				clearTimeout(parent.state.images.clickingPromptTimeout);
				renderer();
			},
			ifNeedToUpdateThenUpdate(parent)
			{
				if (this.bNeedToUpdate)
				{
					this.currentTopic = parent.topics.filter(topic => tools.toUriStandard(topic.name) == parent.sCurrentTopicUri)[0];
					this.currentItem = this.currentTopic.items
						.map((item, index) => [item, index])
						.filter(item => tools.toUriStandard(item[0].title) == parent.sCurrentTopicItemUri)[0];

					this.update(parent);
					this.bNeedToUpdate = false;
				}
			},
			controlHandler(parent, iOffsetValue)
			{
				parent.iCurrentImageIndex = 0;
				const upcomingItem = this.currentTopic.items[this.currentItem[1] + iOffsetValue];
				tools.redirectWithoutReload(
					`/portfolio/${parent.sCurrentTopicUri}/${tools.toUriStandard(upcomingItem.title)}`,
					() => this.beforeRerender(parent)
				);
			},
			update(parent)
			{
				const [item, iItemIndex] = this.currentItem;

				tools.setPageTitle(parent.sTitle + " > " + this.currentTopic.name);
				tools.setHtml("wrapper", parent.baseHtml());
				tools.setHtml("subtitle", this.currentTopic.name);
				tools.setHtml("content", `
					<div class="${parent.sCssPrefix}item">
						<div class="${parent.sCssPrefix}control"></div>
						<div class="${parent.sCssPrefix}title_container">
							<h3 class="${parent.sCssPrefix}title">${item.title}</h3>
							<div class="${parent.sCssPrefix}action">${item.actionType}</div>
							<div class="${parent.sCssPrefix}progress_bar"></div>
						</div>
						<p class="${parent.sCssPrefix}description">${item.description}</p>
						<div class="${parent.sCssPrefix}tech_info">
							<div>
								<span>Platform:</span>
								<span>${item.platform}</span>
							</div>
							<div>
								<span>Tool stack:</span>
								<span>${item.toolStack}</span>
							</div>
						</div>
						<span class="${parent.sCssPrefix}image_count"></span>
						<div class="${parent.sCssPrefix}image_container"></div>
					</div>
				`);
				tools.setHtml(parent.sCssPrefix + "control", `
					<div class="${parent.sCssPrefix}control_left ${!iItemIndex ? parent.sCssPrefix + "disabled_control_item" : ""}"><</div>
					<span class="${parent.sCssPrefix}control_item_count">${iItemIndex + 1}/${this.currentTopic.items.length}</span>
					<div class="${parent.sCssPrefix}control_right ${iItemIndex == this.currentTopic.items.length - 1 ? parent.sCssPrefix + "disabled_control_item" : ""}">></div>
				`);
				tools.setHtml("back", "back");
				
				tools.onClick("back", () => {
					if (!parent.bDownloadProgress)
						tools.redirectWithoutReload("/portfolio", () => this.beforeRerender(parent))
				});
				tools.onClick(parent.sCssPrefix + "control_left", () => {
					if (iItemIndex > 0 && !parent.bDownloadProgress)
						this.controlHandler(parent, -1);
				});
				tools.onClick(parent.sCssPrefix + "control_right", () => {
					if (iItemIndex < this.currentTopic.items.length - 1 && !parent.bDownloadProgress)
						this.controlHandler(parent, 1);
				});
				
				tools.onClick(parent.sCssPrefix + "action", () => {
					if (parent.bDownloadProgress)
						parent.bDownloadProgress = false;
					else
					{
						if (this.currentTopic.items[iItemIndex].actionType == "download")
							parent.downloadExe(this.currentTopic.items[iItemIndex].actionUrl);
						else
							window.open(this.currentTopic.items[iItemIndex].actionUrl)
					}
				});
			}
		},
		images: {
			bNeedToUpdate: true,
			bViewScreenshots: false,
			bLoadingInProgress: false,
			iLoadingProgressLineWidth: 0,
			bScroll: false,
			clickingPromptTimeout: null,
			currentImages: null,
			beforeRerender()
			{
				this.bNeedToUpdate = true;
				renderer();
			},
			ifNeedToUpdateThenUpdate(parent)
			{
				if (this.bNeedToUpdate)
				{
					this.currentImages = parent.state.items.currentItem[0].images;

					this.update(parent);
					this.bNeedToUpdate = false;
					if (this.bScroll)
					{
						tools.scrollToBottom(parent.sCssPrefix + "content");
						this.bScroll = false;
						if (this.currentImages.iLength > 1)
						{
							tools.setHtml(parent.sCssPrefix + "right_image_area", `
								<div class="${parent.sCssPrefix}clicking_prompt_container 
								${parent.sCssPrefix}clicking_prompt_container_transition">
									<span></span>
									<span></span>
									<span></span>
								</div>
							`);
							if (this.clickingPromptTimeout)
								clearTimeout(this.clickingPromptTimeout);
							this.clickingPromptTimeout = setTimeout(() => {
								tools.addClass(parent.sCssPrefix + "clicking_prompt_container", parent.sCssPrefix + "disappearance_clicking_prompt_container");
								this.clickingPromptTimeout = setTimeout(() => {
									tools.removeChild(parent.sCssPrefix + "right_image_area", parent.sCssPrefix + "clicking_prompt_container");
									this.clickingPromptTimeout = null;
								}, 1000);
							}, 3000);
						}
					}
				}
			},
			update(parent)
			{
				tools.setHtml(parent.sCssPrefix + "image_count", `${parent.iCurrentImageIndex + 1}/${this.currentImages.iLength}`);
				if (!this.bViewScreenshots)
				{
					if (!this.bLoadingInProgress)
					{
						tools.setHtml(parent.sCssPrefix + "image_container", `<div class="${parent.sCssPrefix}view_screenshots">view screenshots</div>`);
						tools.onClick(parent.sCssPrefix + "view_screenshots", () => {
							if (this.currentImages.iLoad == 0)
							{
								this.currentImages.onLoadAll(() => {
									this.iLoadingProgressLineWidth = 0;
									this.bViewScreenshots = true;
									this.bScroll = true;
									this.bLoadingInProgress = false;
									parent.toggleButtonsState("enable");
									this.beforeRerender(parent);
								});
								this.currentImages.onLoadEach((loadCountValue) => {
									let iProgressBarWidth = tools.getWidth(parent.sCssPrefix + "image_progress_bar");
									let iProgressBarItemWidth = iProgressBarWidth / this.currentImages.iLength;
									let iProgressBarItemPercent = iProgressBarItemWidth / (iProgressBarWidth / 100);

									this.iLoadingProgressLineWidth = iProgressBarItemPercent * loadCountValue;
									this.beforeRerender(parent);
								});
								this.bLoadingInProgress = true;
								this.currentImages.load();
								parent.toggleButtonsState("disable");
								this.beforeRerender(parent);
							}
							else if (this.currentImages.iLoad < 0)
							{
								this.bViewScreenshots = true;
								this.bScroll = true;
								this.beforeRerender(parent);
							}
						});
					}
					else
					{
						tools.setHtml(parent.sCssPrefix + "image_container", `
							<div class="${parent.sCssPrefix}image_progress_bar">
								<div style="width: ${this.iLoadingProgressLineWidth}%;" class="${parent.sCssPrefix}image_progress_line"></div>
								<span>loading screenshots...</span>
							</div>
						`);
					}
				}
				else
				{
					tools.setHtml(parent.sCssPrefix + "image_container", `
						<div class="${parent.sCssPrefix}left_image_area ${!parent.iCurrentImageIndex ? parent.sCssPrefix + "disabled_area" : ""}"></div>
						<div class="${parent.sCssPrefix}right_image_area ${parent.iCurrentImageIndex == this.currentImages.iLength - 1 ? parent.sCssPrefix + "disabled_area" : ""}"></div>
					`);
					tools.addChild(parent.sCssPrefix + "image_container", this.currentImages.nodes[parent.iCurrentImageIndex]);
					tools.onClick(parent.sCssPrefix + "left_image_area", () => {
						if (parent.iCurrentImageIndex > 0)
						{
							parent.iCurrentImageIndex -= 1;
							clearTimeout(this.clickingPromptTimeout);
							this.beforeRerender();
						}
					});
					tools.onClick(parent.sCssPrefix + "right_image_area", () => {
						if (parent.iCurrentImageIndex < this.currentImages.iLength - 1)
						{
							parent.iCurrentImageIndex += 1;
							clearTimeout(this.clickingPromptTimeout);
							this.beforeRerender();
						}
					});
				}
			}
		},
		preload: {
			bNeedToUpdate: true,
			async ifNeedToUpdateThenUpdate(parent)
			{
				if (this.bNeedToUpdate)
				{
					await this.update(parent);
					this.bNeedToUpdate = false;
				}
			},
			async update(parent)
			{
				/*
					Making GET request to get database.
				*/
				const res = await fetch("/db/portfolio.json");
				const topics = await res.json();

				parent.topics = topics.map((topic, index) => {
					let icon = new Image();
					icon.src = topic.icon;
					icon.alt = "icon";

					return {
						...topic,
						icon,
						items: topic.items.map(item => {
							/*
								Add processed portfolio topic item to local items array.
							*/
							return {
								...item,
								images: {
									nodes: [],
									iLength: item.images.length,
									iLoadCount: 0,
									iLoad: 0,
									onLoadAllCallback: null,
									onLoadEachCallback: null,
									onLoadAll(callback)
									{
										this.onLoadAllCallback = callback;
									},
									onLoadEach(callback)
									{
										this.onLoadEachCallback = callback;
									},
									incrementCounter()
									{
										this.iLoadCount++;
										if (this.iLoadCount == this.iLength)
										{
											setTimeout(() => {
												this.iLoad = -1;
												this.onLoadAllCallback();
											}, 500)
										}
										this.onLoadEachCallback(this.iLoadCount);
									},
									load()
									{
										if (!this.iLoad)
										{
											this.iLoad = true;
											this.nodes = item.images.map(path => {
												let img = new Image();
												img.onload = () => this.incrementCounter();
												img.src = path;
												img.classList.add(parent.sCssPrefix + "image");
												img.alt = "image";
												return img;
											});
										}
									}
								}
							};
						}),
					};
				});
			}
		}
	},
	async render()
	{
		await this.state.preload.ifNeedToUpdateThenUpdate(this);
		if (window.location.pathname != this.sBasePath)
		{
			let sReversedPathParts = window.location.pathname.split("/").reverse();
			let sCurrentTopicUri = sReversedPathParts[1];
			let sCurrentTopicItemUri = sReversedPathParts[0];
			if (this.topics
				.map(topic => tools.toUriStandard(topic.name) == sCurrentTopicUri && topic.items
					.map(item => tools.toUriStandard(item.title) == sCurrentTopicItemUri)
					.reduce((i, j) => i + j))
				.reduce((i, j) => i + j)
			)
			{
				this.sCurrentTopicUri = sCurrentTopicUri;
				this.sCurrentTopicItemUri = sCurrentTopicItemUri;
				this.state.items.ifNeedToUpdateThenUpdate(this);
				this.state.images.ifNeedToUpdateThenUpdate(this);
			}
			else
				return 404;
		}
		else
			this.state.topics.ifNeedToUpdateThenUpdate(this);

		return 200;
	},
	async downloadExe(filePath)
	{
		/*
			Set the switch to true.
		*/
		this.bDownloadProgress = true;

		/*
			Making GET request to get file info (slices length, size, type).
		*/
		let fileInfo = await (await fetch(filePath)).json();

		/*
			Variables initialization.
		*/
		let sFileName = filePath.split("/").slice(-1)[0];
		let sFileType = fileInfo.type;

		let iSlicesLen = parseInt(fileInfo.slicesLen);
		let iSize = parseInt(fileInfo.size);
		let iProgressBarWidth = tools.getWidth(this.sCssPrefix + "progress_bar");
		let iProgressBarItemWidth = iProgressBarWidth / iSlicesLen;
		let iProgressBarItemPercent = iProgressBarItemWidth / (iProgressBarWidth / 100);
		let iProgressBarPercentCount = iProgressBarItemPercent;
		let iSliceCount = 0;
		let iSizeCount = 0;

		let binaryData = [];

		/*
			Update UI.
		*/
		tools.setHtml(this.sCssPrefix + "action", "stop");
		tools.addClass(this.sCssPrefix + "progress_bar", this.sCssPrefix + "progress_bar_doing");
		tools.addClass(this.sCssPrefix + "action", this.sCssPrefix + "action_doing");
		this.toggleButtonsState("disable");

		/*
			Get file slices until you get everything, or the user clicks "stop".
		*/
		while (iSliceCount < iSlicesLen && this.bDownloadProgress)
		{
			/*
				Making GET request to get slice of file as array buffer.
			*/
			let res = await fetch(`${filePath}/${iSliceCount}`);
			let arrayBuffer = await res.arrayBuffer();

			/*
				Save slice of file as array buffer in local binaryData array.
			*/
			binaryData.push(arrayBuffer);

			/*
				Increase the width of progress bar.
			*/
			tools.setHtml(this.sCssPrefix + "progress_bar", `
				<div style="width: ${iProgressBarPercentCount}%;" class="${this.sCssPrefix}progress_line"></div>
				<div class="${this.sCssPrefix}progress_info_tablo">
					<span>
						${Math.ceil((iSizeCount + arrayBuffer.byteLength) / 1000)}kb / ${Math.ceil(iSize / 1000)}kb
					</span>
					<span>
						${Math.round(iProgressBarPercentCount, 2)}% / 100%
					</span>
				</div>
			`);
			
			/*
				Change counters state.
			*/
			iProgressBarPercentCount += iProgressBarItemPercent;
			iSliceCount++;
			iSizeCount += arrayBuffer.byteLength;
		}
		
		/*
			If download complete.
		*/
		if (this.bDownloadProgress)
		{
			/*
				Download binaryData to local file.
			*/
			tools.download(binaryData, sFileType, sFileName);

			/*
				Show pop-up message.
			*/
			msg.show(`Download: "${sFileName}"`);

			/*
				Set the switch to true;
			*/
			this.bDownloadProgress = false;

			/*
				Update UI.
			*/
			tools.removeChild(this.sCssPrefix + "title_container", this.sCssPrefix + "action");
			tools.replaceClass(this.sCssPrefix + "progress_bar", this.sCssPrefix + "progress_bar_doing",
				this.sCssPrefix + "progress_bar_complete");
		}
		else
		{
			/*
				Update UI.
			*/
			tools.setHtml(this.sCssPrefix + "progress_bar", "");
			tools.setHtml(this.sCssPrefix + "action", "download");
			tools.removeClass(this.sCssPrefix + "progress_bar", this.sCssPrefix + "progress_bar_doing");
			tools.removeClass(this.sCssPrefix + "action", this.sCssPrefix + "action_doing");
		}

		/*
			Update UI.
		*/
		this.toggleButtonsState("enable");
	}
}