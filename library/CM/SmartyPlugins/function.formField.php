<?php

function smarty_function_formField(array $params, Smarty_Internal_Template $template) {
    /** @var CM_Render $render */
    $render = $template->smarty->getTemplateVars('render');
    /** @var CM_Form_Abstract $form */
    $form = $render->getStackLast('forms');

    $class = null;
    if (isset($params['class'])) {
        $class = (string) $params['class'];
        unset($params['class']);
    }

    $label = null;
    if (isset($params['label'])) {
        $label = (string) $params['label'];
    }

    $input = null;
    $inputName = null;
    if (isset($params['prepend'])) {
        $input .= (string) $params['prepend'];
    }
    if (isset($params['name'])) {
        $renderParams = CM_Params::factory($params);
        $inputName = (string) $params['name'];
        $field = $form->getField($inputName);
        $renderAdapter = new CM_RenderAdapter_FormField($render, $field);
        $input .= $renderAdapter->fetch($renderParams, $form, $inputName);
    }
    if (isset($params['append'])) {
        $input .= (string) $params['append'];
    }

    $html = '<div class="formField clearfix ' . $inputName . ' ' . $class . '">';
    if ($label) {
        $html .= '<label';
        if ($inputName) {
            $html .= ' for="' . $form->getAutoId() . '-' . $inputName . '-input"';
        }
        $html .= '>' . $label . '</label>';
    }
    if ($input) {
        $html .= '<div class="input">';
        $html .= $input;
        $html .= '</div>';
    }
    $html .= '</div>';

    return $html;
}
