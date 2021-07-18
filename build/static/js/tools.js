let localHistory = [window.location.pathname];

class tools
{
	static isNumber(n) {return /^-?[\d.]+(?:e-?\d+)?$/.test(n)};

	static toUriStandard(string)
	{
		return string
			.toLowerCase()
			.replace(" ", "_")
			.replace("-", "_")
			.split(".")[0];
	};

	static imprecisePath(sPath, sRealPath)
	{
		let sPathParts = sPath.split("/");
		let sRealPathParts = sRealPath.split("/");

		if (sRealPathParts.length < sPathParts.length && sPath.includes(sRealPath))
			return true;

		if (sPathParts.length == sRealPathParts.length)
			if (sPath.includes("[int]"))
				return sPathParts.map(
					(sPart, index) => sPart == "[int]" ? tools.isNumber(sRealPathParts[index]) : sPart == sRealPathParts[index]).every(b => b);
			else if (sPath.includes("[str]"))
				return true;
		return false;
	}

	static insertBefore(sClassName, html)
	{
		document.getElementsByClassName(sClassName)[0].insertAdjacentHTML('beforebegin', html);
	}

	static insertAfter(sClassName, html)
	{
		document.getElementsByClassName(sClassName)[0].insertAdjacentHTML('afterbegin', html);
	}

	static scrollToBottom(sClassName)
	{
		let element = document.getElementsByClassName(sClassName)[0];
		element.scrollTop = element.scrollHeight;
	}

	static scrollToTop(sClassName)
	{
		document.getElementsByClassName(sClassName)[0].scrollTop = 0;
	}

	//

	static removeClass(sClassName, sClass)
	{
		document.getElementsByClassName(sClassName)[0].classList.remove(sClass);
	}

	static removeChild(sParentClassName, sChildClassName)
	{
		document.getElementsByClassName(sParentClassName)[0].removeChild(document.getElementsByClassName(sChildClassName)[0]);
	}

	//

	static getWidth(sClassName)
	{
		return document.getElementsByClassName(sClassName)[0].getBoundingClientRect().width;
	}

	//

	static addClass(sClassName, sClass)
	{
		document.getElementsByClassName(sClassName)[0].classList.add(sClass);
	}

	static replaceClass(sClassName, sClass, sNewClass)
	{
		document.getElementsByClassName(sClassName)[0].classList.remove(sClass);
		tools.addClass(sClassName, sNewClass);
	}

	static addChild(sClassName, child)
	{
		document.getElementsByClassName(sClassName)[0].appendChild(child);
	}

	static setWidth(sClassName, sWidth)
	{
		document.getElementsByClassName(sClassName)[0].style.width = sWidth;
	}

	static setCss(sClassName, sCss)
	{
		document.getElementsByClassName(sClassName)[0].style.cssText = sCss;
	}

	static setHtml(sClassName, sHtml)
	{
		document.getElementsByClassName(sClassName)[0].innerHTML = sHtml;
	}

	static setPageTitle(sTitle)
	{
		document.title = sTitle;
	}

	//

	static onClick(sClassName, callback)
	{
		document.getElementsByClassName(sClassName)[0].addEventListener("click", () => callback());
	}

	static onPopState(callback)
	{
		window.addEventListener("popstate", callback);
	}

	static onWindowLoad(callback)
	{
		window.addEventListener("load", callback);
	}

	//

	static redirect(sUrlPath)
	{
		window.location.replace(sUrlPath);
	}

	static redirectWithoutReload(sUrlPath, renderer)
	{
		window.history.replaceState(null, "ZERDICORP", sUrlPath);
		renderer();
	}

	static async copyToClipboard(text, showMessage = null)
	{
		let iResultState = -1;
		try
		{
			if (typeof(navigator.clipboard) == "undefined")
			{
				let textArea = document.createElement("textarea");
				textArea.value = text;
				textArea.style.position = "fixed";
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();

				if (document.execCommand("copy"))
				{
					iResultState = 0;
					if (showMessage)
						showMessage(`Copied: \"${text}\"`);
				}

				document.body.removeChild(textArea);
			}
			else
				await navigator.clipboard.writeText(text)
					.then(() => {
						iResultState = 0;
						if (showMessage)
							showMessage(`Copied: \"${text}\"`)
					},
					(err) => {
						console.log("COPY ERROR: " + err);
						iResultState = -1;
					});
		}
		catch(err)
		{
			console.log("COPY ERROR: " + err);
			iResultState = -1;
		}
		return iResultState;
	}

	static download(binaryData, sDataType, sFileName)
	{
		let blob = new Blob(binaryData, {type: sDataType});
		if (window.navigator.msSaveOrOpenBlob) // IE10+
			window.navigator.msSaveOrOpenBlob(blob, sFileName);
		else
		{
			var a = document.createElement("a"),
			url = URL.createObjectURL(blob);
			a.href = url;
			a.download = sFileName;
			document.body.appendChild(a);
			a.click();
			setTimeout(() => {
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);  
			}, 0); 
		}
	}
};