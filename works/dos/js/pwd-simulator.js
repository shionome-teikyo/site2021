////////////////////////////////////////////////////////////////////////////////
//  メイン
////////////////////////////////////////////////////////////////////////////////

jQuery( function() {
  
  //// メイン処理開始
  
  var world = new World({
    width: 500, 
    height: 500,
    target: '#main_canvas',
    elm_person_num: '#person_num',
    elm_turn_num: '#turn_num',
    elm_speed_num: '#speed_num',
    elm_draw_arrow: '#draw_arrow',
    elm_start_button: '#start_button',
    elm_reset_button: '#reset_button',
    elm_selected_person: '#selected_person',
    elm_person_name: '#person_name',
    elm_person_dname: '#person_dname',
    elm_person_organization: '#person_organization',
    elm_person_mh: '#person_mh',
    elm_person_x: '#person_x',
    elm_person_y: '#person_y',
    elm_person_sa: '#person_sa',
    elm_person_sb: '#person_sb',
    elm_person_ia: '#person_ia',
    elm_person_ib: '#person_ib',
    elm_person_delete_button: '#person_delete_button',
    elm_turn_count: '#turn_count',
    elm_person_count: '#person_count',
    elm_person_information_area: '.person_information_area',
  });
  
});

function addText(param)
{
  CR = String.fromCharCode(10);
  var txt = document.statusBox.statusText.value + param + CR;
  document.statusBox.statusText.value = txt;
}
