import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Api from '../utils/api';
import AppStyle from '../theme/styles';
import Dialog from './dialog';
import CustomWebView from './CustomWebView';
import MarkdownHelper from '../utils/MarkdownHelper';

export const NATIVE = 'native';
export const NET = 'net';

class HtmlView extends Component {
  static componentName = 'HtmlView';

  static propTypes = {
    type: PropTypes.string,
    url: PropTypes.string,
    domain: PropTypes.string,
    slug: PropTypes.string,
    dialogContent: PropTypes.string,
    isFullSlug: PropTypes.bool,
  };

  static defaultProps = {
    type: NATIVE,
    url: '',
    domain: '',
    slug: '',
    dialogContent: '',
    isFullSlug: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      html: '',
    };
  }

  componentDidMount() {
    if (this.props.type === NET) {
      Api.get(this.props.url)
        .then(response => this.setState({
          visible: false,
          html: MarkdownHelper.convert(response.data) }))
        .catch(err => this.setState({
          visible: false,
          html: err.message,
        }));
    } else {
      const basePath = Platform.OS === 'ios'
        ? RNFS.MainBundlePath
        : RNFS.ExternalDirectoryPath;
      if (basePath) {
        let slug = '';
        if (this.props.isFullSlug) {
          slug = this.props.slug;
        } else {
          slug = `/growth-content/${this.props.domain}/${this.props.slug}.html`;
        }

        RNFS.readFile(basePath.concat(slug), 'utf8')
          .then((result) => {
            this.setState({
              html: result,
              visible: false,
            });
          });
      }
    }
  }

  render() {
    return (
      <View style={[AppStyle.detailBasisStyle, { flex: 1 }]} >
        {
          this.props.type === NATIVE
            ? null
            : <Dialog show={this.state.visible} content={this.props.dialogContent} />
        }
        <CustomWebView html={this.state.html} />
      </View>);
  }
}
export default HtmlView;
