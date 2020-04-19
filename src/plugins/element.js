import Vue from 'vue'
// import Element from 'element-ui'
import '../assets/css/element-variables.scss'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition';
import {
    Pagination,
    Dialog,
    Autocomplete,
    Input,
    Radio,
    RadioGroup,
    RadioButton,
    Checkbox,
    CheckboxGroup,
    Select,
    Option,
    OptionGroup,
    Button,
    Table,
    TableColumn,
    DatePicker,
    TimePicker,
    Popover,
    Tooltip,
    Form,
    FormItem,
    Icon,
    Row,
    Col,
    Upload,
    CascaderPanel,
    Cascader,
    Collapse,
    CollapseItem,
    Loading,
    MessageBox,
    Message,
    Popconfirm,
    Transfer 

  } from 'element-ui';
  
  Vue.use(Pagination);
  Vue.use(Dialog);
  Vue.use(Autocomplete);
  Vue.use(Input);
  Vue.use(Radio);
  Vue.use(RadioGroup);
  Vue.use(RadioButton);
  Vue.use(Checkbox);
  Vue.use(CheckboxGroup);
  Vue.use(Select);
  Vue.use(Option);
  Vue.use(OptionGroup);
  Vue.use(Button);
  Vue.use(Table);
  Vue.use(TableColumn);
  Vue.use(DatePicker);
  Vue.use(TimePicker);
  Vue.use(Popover);
  Vue.use(Tooltip);
  Vue.use(Form);
  Vue.use(FormItem);
  Vue.use(Icon);
  Vue.use(Row);
  Vue.use(Col);
  Vue.use(Upload);
  Vue.use(CascaderPanel);
  Vue.use(Cascader);
  Vue.use(Popconfirm);
  Vue.use(Collapse);
  Vue.use(CollapseItem);
  Vue.use(Transfer);
  Vue.use(Loading.directive);
  Vue.prototype.$loading = Loading.service;
  Vue.prototype.$confirm = MessageBox.confirm;
  Vue.prototype.$prompt = MessageBox.prompt;
  Vue.prototype.$message = Message;
  Vue.component(CollapseTransition.name, CollapseTransition)
// Vue.use(Element)
