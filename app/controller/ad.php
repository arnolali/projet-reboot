<?php

class Ad extends Controller
{
    public function format($w, $h)
    {
        $ad_model = $this->loadModel('AdModel');

        $this->data->meta->title = $this->getTitle( $w . "x" . $h );
        $this->ad->w = intVal( $w );
        $this->ad->h = intVal( $h );
        $this->ad->format = $this->ad->w . "x" . $this->ad->h;
        $this->settings = $ad_model->getAllInteractivities( $w . "x" . $h );
        
        $text = file_get_contents( 'data/fr/text.json' );
        $this->text = json_decode( $text );

        //print_r($this); // Voir l'objet passé au template
        require 'app/views/ad.php';
    }
}