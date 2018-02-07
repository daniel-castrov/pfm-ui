import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import * as $ from 'jquery';

declare const $: any;

@Component({
  selector: 'app-access-change',
  templateUrl: './access-change.component.html',
  styleUrls: ['./access-change.component.css']
})

export class AccessChangeComponent implements OnInit {


  @ViewChild(HeaderComponent) header;

    public ngOnInit() {

      $(document).ready(function() {
          $('#btn-add').click(function(){
              $('#select-from option:selected').each( function() {
                      $('#select-to').append("<option value='"+$(this).val()+"'>"+$(this).text()+"</option>");
                  $(this).remove();
              });
          });
          $('#btn-remove').click(function(){
              $('#select-to option:selected').each( function() {
                  $('#select-from').append("<option value='"+$(this).val()+"'>"+$(this).text()+"</option>");
                  $(this).remove();
              });
          });
          $('#btn-up').bind('click', function() {
              $('#select-to option:selected').each( function() {
                  var newPos = $('#select-to option').index(this) - 1;
                  if (newPos > -1) {
                      $('#select-to option').eq(newPos).before("<option value='"+$(this).val()+"' selected='selected'>"+$(this).text()+"</option>");
                      $(this).remove();
                  }
              });
          });
          $('#btn-down').bind('click', function() {
              var countOptions = $('#select-to option').size();
              $('#select-to option:selected').each( function() {
                  var newPos = $('#select-to option').index(this) + 1;
                  if (newPos < countOptions) {
                      $('#select-to option').eq(newPos).after("<option value='"+$(this).val()+"' selected='selected'>"+$(this).text()+"</option>");
                      $(this).remove();
                  }
              });
          });
          $('#btn-up-source').bind('click', function() {
              $('#select-from option:selected').each( function() {
                  var newPos = $('#select-from option').index(this) - 1;
                  if (newPos > -1) {
                      $('#select-from option').eq(newPos).before("<option value='"+$(this).val()+"' selected='selected'>"+$(this).text()+"</option>");
                      $(this).remove();
                  }
              });
          });
          $('#btn-down-source').bind('click', function() {
              var countOptions = $('#select-from option').size();
              $('#select-from option:selected').each( function() {
                  var newPos = $('#select-from option').index(this) + 1;
                  if (newPos < countOptions) {
                      $('#select-from option').eq(newPos).after("<option value='"+$(this).val()+"' selected='selected'>"+$(this).text()+"</option>");
                      $(this).remove();
                  }
              });
          });

          $('#multi').submit( function () {
              var selectalla = $('#select-to').val();
              if(!selectalla) {
                  $('#select-to option').attr('selected','selected');
              }
              var selectallb = $('#select-from').val();
              if(!selectallb) {
                  $('#select-from option').attr('selected','selected');
              }

          });

      });

    }
  }
