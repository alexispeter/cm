<?php

class CM_Asset_Css_View extends CM_Asset_Css {

	/**
	 * @param CM_Render  $render
	 * @param string     $className
	 * @throws CM_Exception
	 */
	public function __construct(CM_Render $render, $className) {
		parent::__construct($render);
		if (!preg_match('#^([^_]+)_([^_]+)_(.+)$#', $className, $matches)) {
			throw new CM_Exception("Cannot detect namespace from component's class-name");
		}
		list($className, $namespace, $viewType, $viewName) = $matches;
		$relativePaths = array();
		$paths = array();
		foreach ($render->getSite()->getThemes() as $theme) {
			$basePath = $render->getThemeDir(true, $theme, $namespace) . $viewType . '/' . $viewName . '/';
			foreach (CM_Util::rglob('*.less', $basePath) as $path) {
				$paths[] = $path;
				$relativePaths[] = preg_replace('#^' . $basePath . '#', '', $path);
			}
		}
		foreach (array_unique($relativePaths) as $path) {
			$prefix = '.' . $className;
			if ('Component' == $viewType) {
				if ($path != 'default.less' && strpos($path, '/') === false) {
					$prefix .= '.' . preg_replace('#.less$#', '', $path);
				}
			}

			$file = $render->getLayoutFile($viewType . '/' . $viewName . '/' . $path, $namespace);
			$this->add($file->read(), $prefix);
		}
	}
}
