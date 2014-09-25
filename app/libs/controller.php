<?php

/**
 * This is the "base controller class". All other "real" controllers extend this class.
 */
class Controller
{
    function __construct()
    {
        $this->path = new stdClass();
        $this->path->root =      URL;
        $this->path->styles =    URL . 'public/styles/';
        $this->path->scripts =   URL . 'public/scripts/';
        $this->path->images =    URL . 'public/images/';
        $this->path->data =      URL . 'data/';
        $this->path->templates = URL . 'app/templates/';

        $this->getCulture();
        $this->getText();
        $this->getFormats();
    }

    private function getCulture()
    {
        $this->culture = "fr";
        if(isset($_GET['lang'])) {
            $this->culture = $_GET['lang'];
        }
    }

    private function getText()
    {
        $text = file_get_contents($this->path->data . $this->culture . "/text.json");
        $this->data->text = json_decode($text, true);
    }

    private function getFormats()
    {
        $formats = file_get_contents($this->path->data . "/formats.json");
        $this->data->formats = json_decode($formats, true);
    }

    public function getTitle($title) {
        return $title . " | " . $this->data->text["site-name"];
    }

    public function loadModel($model_name)
    {
        require 'app/models/' . strtolower($model_name) . '.php';
        return new $model_name($this);
    }
}