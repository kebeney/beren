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
import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { SupportPage } from '../pages/support/support';

import { ConferenceData } from '../providers/conference-data';
import { UserData } from '../providers/user-data';
import {componentReducer} from "../providers/reducers";
import {StoreModule} from "@ngrx/store";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {EffectsModule} from "@ngrx/effects";
import {MainEffects} from "../providers/effects";
import {GooglePlus} from "@ionic-native/google-plus";
import {Facebook} from "@ionic-native/facebook";
import {Config} from "../providers/config";
import {DatePipe} from "@angular/common";
import {StatusBar} from "@ionic-native/status-bar";
import {Oauth} from "../providers/oauth";
import {QuestionView} from "../components/question-view/question-view";
import {GenericView} from "../components/generic-view/generic-view";
import {Display} from "../components/display/display";
import {AuthProvider} from "../providers/auth";
import {FunctionsProvider} from "../providers/functions";
import {QuestionsProvider} from "../providers/questions/questions";
import {ApartmentPage} from "../pages/apartment/apartment";
import {DynamicFormComponent} from "../providers/questions/dynamic-form.component";
import {DynamicFormQuestionComponent} from "../providers/questions/dynamic-form-question.component";
import { RoomsSummaryComponent } from '../components/rooms-summary/rooms-summary';
import {PaymentsPage} from "../pages/payments/payments";
import {TenantHomePage} from "../pages/tenant-home/tenant-home";
import { TenantSectionComponent } from '../components/tenant-section/tenant-section';
import { LandlordSectionComponent } from '../components/landlord-section/landlord-section';
import {HomePage} from "../pages/home/home";


@NgModule({
  declarations: [
    ConferenceApp,
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
    ApartmentPage,
    HomePage,

    DynamicFormComponent,
    DynamicFormQuestionComponent,
    Display,
    GenericView,
    QuestionView,
    RoomsSummaryComponent,
    PaymentsPage,
    TenantHomePage,
    TenantSectionComponent,
    LandlordSectionComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(ConferenceApp, {}, {
      links: [
        { component: TabsPage, name: 'TabsPage', segment: 'tabs' },
        { component: SchedulePage, name: 'Schedule', segment: 'schedule' },
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
        { component: ApartmentPage, name: 'ApartmentPage', segment: 'apts' },
        { component: TenantHomePage, name: 'tenantHomPage', segment: 'tenantHome'},
        { component: PaymentsPage, name: 'PaymentsPage', segment: 'payments'},
        { component: HomePage, name: 'homePage', segment: 'home'}
      ]
    }),
    IonicStorageModule.forRoot(),
    StoreModule.provideStore({componentReducer: componentReducer}),
    FormsModule,
    EffectsModule.run(MainEffects),
    ReactiveFormsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ConferenceApp,
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
    Display,
    GenericView,
    QuestionView,
    RoomsSummaryComponent,
    ApartmentPage,
    PaymentsPage,
    TenantHomePage,
    HomePage
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ConferenceData,
    UserData,
    InAppBrowser,
    SplashScreen,
    StatusBar,
    DatePipe,
    Config,
    Facebook,
    GooglePlus,
    Oauth,
    AuthProvider,
    FunctionsProvider,
    QuestionsProvider
  ]
})
export class AppModule { }
