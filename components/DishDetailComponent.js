import React, { Component } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  Modal,
  Button,
  Alert,
  PanResponder
} from "react-native";
import { Card, Icon, Input, Rating } from "react-native-elements";
import { connect } from "react-redux";
import { baseUrl } from "../shared/baseUrl";
import { postFavorite, postComment } from "../redux/ActionCreators";
import * as Animatable from "react-native-animatable";

const mapStateToProps = state => {
  return {
    dishes: state.dishes,
    comments: state.comments,
    favorites: state.favorites
  };
};

const mapDispatchToProps = dispatch => ({
  postFavorite: dishId => dispatch(postFavorite(dishId)),
  postComment: comment => dispatch(postComment(comment))
});

function RenderDish(props) {
  const dish = props.dish;

  const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
    if (dx < -200) return true;
    else return false;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (e, gestureState) => {
      return true;
    },
    onPanResponderEnd: (e, gestureState) => {
      if (recognizeDrag(gestureState))
        Alert.alert(
          "Add to Favorites?",
          "Are you sure you wish to add " + dish.name + " to your favorites?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel pressed"),
              style: "cancel"
            },
            {
              text: "OK",
              onPress: () =>
                props.favorite
                  ? console.log("Already favorite")
                  : props.onPress()
            }
          ],
          { cancelable: false }
        );
      return true;
    }
  });

  if (dish != null) {
    return (
      <Animatable.View
        animation="fadeInDown"
        duration={2000}
        delay={1000}
        {...panResponder.panHandlers}
      >
        <Card featuredTitle={dish.name} image={{ uri: baseUrl + dish.image }}>
          <Text style={{ margin: 10 }}>{dish.description}</Text>
          <View style={styles.cardRow}>
            <Icon
              raised
              reverse
              name={props.favorite ? "heart" : "heart-o"}
              type="font-awesome"
              color="#f50"
              onPress={() =>
                props.favorite
                  ? console.log("Already favorite")
                  : props.onPress()
              }
            />
            <Icon
              raised
              reverse
              name={"pencil"}
              type="font-awesome"
              color="#512DA8"
              style={styles.cardItem}
              onPress={() => props.onShowModal()}
            />
          </View>
        </Card>
      </Animatable.View>
    );
  } else {
    return <View></View>;
  }
}

function RenderComments(props) {
  const comments = props.comments;

  const renderCommentItem = ({ item, index }) => {
    return (
      <View key={index} style={{ margin: 10 }}>
        <Text style={{ fontSize: 14 }}>{item.comment}</Text>
        <Rating startingValue={item.rating} imageSize={15} readonly />
        <Text style={{ fontSize: 12 }}>
          {"-- " + item.author + ", " + item.date}
        </Text>
      </View>
    );
  };

  return (
    <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
      <Card title="Comments">
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={item => item.id.toString()}
        />
      </Card>
    </Animatable.View>
  );
}

class DishDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      rating: 5,
      author: "",
      comment: ""
    };
  }

  markFavorite(dishId) {
    this.props.postFavorite(dishId);
  }

  static navigationOptions = {
    title: "Dish Details"
  };

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  resetForm() {
    this.setState({
      rating: 5,
      author: "",
      comment: ""
    });
  }

  handleComment(dishId) {
    this.toggleModal();
    const comment = {
      dishId: dishId,
      rating: this.state.rating,
      author: this.state.author,
      comment: this.state.comment
    };
    this.props.postComment(comment);
  }

  render() {
    const dishId = this.props.navigation.getParam("dishId", "");

    return (
      <ScrollView>
        <RenderDish
          dish={this.props.dishes.dishes[+dishId]}
          favorite={this.props.favorites.some(el => el === dishId)}
          onPress={() => this.markFavorite(dishId)}
          onShowModal={() => this.toggleModal(dishId)}
        />
        <RenderComments
          comments={this.props.comments.comments.filter(
            comment => comment.dishId === dishId
          )}
        />
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.showModal}
          onDismiss={() => {
            this.toggleModal();
            this.resetForm;
          }}
          onRequestClose={() => {
            this.toggleModal();
            this.resetForm;
          }}
        >
          <View style={styles.modal}>
            <Rating
              showRating
              startingValue={this.state.rating}
              onFinishRating={rating => this.setState({ rating: rating })}
            />
            <Input
              onChangeText={author => this.setState({ author: author })}
              placeholder="Author"
            />
            <Input
              onChangeText={comment => this.setState({ comment: comment })}
              placeholder="Comment"
            />
            <View style={{ marginTop: 15 }}>
              <Button
                onPress={() => {
                  this.handleComment(dishId);
                  this.resetForm;
                }}
                color="#512DA8"
                title="Submit"
              />
            </View>
            <View style={{ marginTop: 15 }}>
              <Button
                onPress={() => {
                  this.toggleModal();
                  this.resetForm;
                }}
                color="gray"
                title="Cancel"
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  cardRow: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
    margin: 20
  },
  cardItem: {
    flex: 1,
    margin: 10
  },
  modal: {
    justifyContent: "center",
    margin: 20
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DishDetail);
