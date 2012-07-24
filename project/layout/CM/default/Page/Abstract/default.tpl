<!doctype html>
<html {if $render->getLanguage()}lang="{$render->getLanguage()->getAbbreviation()}"{/if} class="{block name='html-class'}{/block}">
	<head>
		<meta charset="utf-8">
		<meta name="description" content="{"{block name='head-description'}{/block}"|escape}">
		<meta name="keywords" content="{"{block name='head-keywords'}{/block}"|escape}">
		<title>{block name='title'}{/block}</title>
		{resource file='library.css'}
		{resource file='internal.css'}
		{resource file='init.js'}
		{block name='head'}{/block}
	</head>
	<body id="{$pageObj->getAutoId()}" class="{$pageObj->getClassHierarchy()|implode:' '}">
		{block name='body-start'}{/block}
		{block name='body'}{/block}
		{if $smarty.const.IS_DEBUG}{component name='CM_Component_Debug'}{/if}
		{resource file='library.js'}
		{resource file='internal.js'}
		{if $language = $render->getLanguage()}
			{resource file="translations/{CM_Model_Language::getVersionJavascript()}/{$language->getId()}.js"}
		{/if}
		{$render->getJs()->renderScripts()}
		{CM_Tracking::getInstance()->getHtml()}
		{block name='body-end'}{/block}
	</body>
</html>
