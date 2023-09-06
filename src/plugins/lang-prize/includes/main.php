<?php

class LangPrize extends UcdlibAwardsAwardAbstract {

  protected $_slug = 'lang_prize';
	protected $_title = "Lang Prize";

  protected $_adminMenuTitle = "Lang Prize";
  protected $_adminMenuPageTitle = "UC Davis Lang Prize";
  protected $_adminMenuSlugs = [
    'main' => 'lang-prize-admin',
    'cycles' => 'lang-prize-admin-cycles'
  ];

}
