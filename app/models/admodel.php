<?php

class AdModel
{
    function __construct($obj) {
        try {
            $this->obj = $obj;
        } catch (PDOException $e) {
            //exit('Database connection could not be established.');
        }
    }

    public function getAllInteractivities($format)
    {
        $settingsFormats = file_get_contents($this->obj->path->data . "settings/" . $format . ".json");
        $format = json_decode($settingsFormats, true);
        return $format;
    }
}