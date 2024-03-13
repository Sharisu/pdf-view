import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import PdfEditScreen from './src/screens/PdfViewerScreen';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
    return (
        <GestureHandlerRootView style={styles.container}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Home">
                    <Stack.Screen name="Home" component={HomeScreen} options={{title: 'PDF Manager'}}/>
                    <Stack.Screen name="PdfEdit" component={PdfEditScreen} options={{title: 'Edit PDF'}}/>
                </Stack.Navigator>
            </NavigationContainer>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})

export default App;
