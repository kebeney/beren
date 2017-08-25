import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SplashScreen } from '@ionic-native/splash-screen';

import { IonicStorageModule } from '@ionic/storage';

import { ConferenceApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { PopoverPage } from '../pages/about-popover/about-popover';
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { MapPage } from '../pages/map/map';
import { SchedulePage } from '../pages/schedule/schedule';
import { ScheduleFilterPage } from '../pages/schedule-filter/schedule-filter';
import { SessionDetailPage } from '../pages/session-detail/session-detail';
import { SignupPage } from '../pages/signup/signup';
import { SpeakerDetailPage } from '../pages/speaker-detail/speaker-detail';
import { SpeakerListPage } from '../pages/speaker-list/speaker-list';
import { TabsPage } from '../pages/tabs-page/tabs-page';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { SupportPage } from '../pages/support/support';

import { ConferenceData } from '../providers/conference-data';
import { UserData } from '../providers/user-data';
import { FunctionsProvider } from '../providers/functions/functions';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {EffectsModule} from "@ngrx/effects";
import {StoreModule} from "@ngrx/store";
import {EffectsProvider} from "../providers/effects/effects";
import {ConfigsProvider} from "../providers/configs/configs";
import { ToastProvider } from '../providers/toast/toast';
import { StateWideReducerProvider } from '../providers/state-wide-reducer/state-wide-reducer';
import { UserDataProvider } from '../providers/user-data/user-data';
import { QuestionsProvider } from '../providers/questions/questions';
import {DynamicFormComponent} from "../providers/questions/dynamic-form.component";
import {DynamicFormQuestionComponent} from "../providers/questions/dynamic-form-question.component";
import {DatePipe} from "@angular/common";
import {QuestionViewPage} from "../pages/question-view/question-view";
import {HomePage} from "../pages/home/home";
import {DisplayPage} from "../pages/display/display";
import {RoomSummaryPage} from "../pages/room-summary/room-summary";


@NgModule({
  declarations: [
    ConferenceApp,
    HomePage,
    AboutPage,
    AccountPage,
    LoginPage,
    MapPage,
    PopoverPage,
    SchedulePage,
    ScheduleFilterPage,
    SessionDetailPage,
    SignupPage,
    SpeakerDetailPage,
    SpeakerListPage,
    TabsPage,
    TutorialPage,
    SupportPage,
    DynamicFormComponent,
    DynamicFormQuestionComponent,
    QuestionViewPage,
    DisplayPage,
    RoomSummaryPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(ConferenceApp, {}, {
      links: [
        { component: TabsPage, name: 'TabsPage', segment: 'tabs-page' },
        { component: HomePage, name: 'Home', segment: 'home' },
        { component: SessionDetailPage, name: 'SessionDetail', segment: 'sessionDetail/:sessionId' },
        { component: ScheduleFilterPage, name: 'ScheduleFilter', segment: 'scheduleFilter' },
        { component: SpeakerListPage, name: 'SpeakerList', segment: 'speakerList' },
        { component: SpeakerDetailPage, name: 'SpeakerDetail', segment: 'speakerDetail/:speakerId' },
        { component: MapPage, name: 'Map', segment: 'map' },
        { component: AboutPage, name: 'About', segment: 'about' },
        { component: TutorialPage, name: 'Tutorial', segment: 'tutorial' },
        { component: SupportPage, name: 'SupportPage', segment: 'support' },
        { component: LoginPage, name: 'LoginPage', segment: 'login' },
        { component: AccountPage, name: 'AccountPage', segment: 'account' },
        { component: SignupPage, name: 'SignupPage', segment: 'signup' },
        { component: DisplayPage, name: 'DisplayPage', segment: 'display' },
        { component: RoomSummaryPage, name: 'RoomSummaryPage', segment: 'roomSummary/:parentId' }

      ]
    }),
    IonicStorageModule.forRoot(),
    StoreModule.forRoot({stateReducer: StateWideReducerProvider}),
    FormsModule,
    EffectsModule.forRoot([EffectsProvider]),
    ReactiveFormsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ConferenceApp,
    HomePage,
    AboutPage,
    AccountPage,
    LoginPage,
    MapPage,
    PopoverPage,
    SchedulePage,
    ScheduleFilterPage,
    SessionDetailPage,
    SignupPage,
    SpeakerDetailPage,
    SpeakerListPage,
    TabsPage,
    TutorialPage,
    SupportPage,
    QuestionViewPage,
    DisplayPage,
    RoomSummaryPage
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ConferenceData,
    UserData,
    InAppBrowser,
    SplashScreen,
    FunctionsProvider,
    ConfigsProvider,
    ToastProvider,
    UserDataProvider,
    QuestionsProvider,
    DatePipe
  ]
})
export class AppModule { }
