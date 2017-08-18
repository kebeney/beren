name := """Beren"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayJava)

scalaVersion := "2.12.2"

libraryDependencies += javaJpa

libraryDependencies ++= Seq(javaWs)

libraryDependencies += "org.mockito" % "mockito-core" % "2.1.0"

libraryDependencies += javaWs % "test"

libraryDependencies += guice

libraryDependencies += filters

libraryDependencies += "org.hibernate" % "hibernate-core" % "5.2.10.Final"

libraryDependencies += "org.postgresql" % "postgresql" % "42.0.0"

libraryDependencies += "org.mongodb" % "mongodb-driver" % "3.4.0"

libraryDependencies += "org.mongodb.morphia" % "morphia" % "1.3.2"

libraryDependencies += "io.jsonwebtoken" % "jjwt" % "0.7.0"

libraryDependencies += "com.auth0" % "java-jwt" % "3.2.0"

//libraryDependencies += "com.google.api.client" % "google-api-client-util" % "1.2.3-alpha" force()

libraryDependencies += "com.google.http-client" % "google-http-client" % "1.22.0"

libraryDependencies += "com.google.api-client" % "google-api-client" % "1.22.0"

libraryDependencies += "com.google.apis" % "google-api-services-gmail" % "v1-rev70-1.22.0"

libraryDependencies += "javax.mail" % "mail" % "1.5.0-b01"

//Migration to play 2.6.x

//libraryDependencies += "com.typesafe.play" %% "play-json" % "2.6.0"
//libraryDependencies += openId
//libraryDependencies += "com.typesafe.play" %% "play-iteratees" % "2.6.1"
//libraryDependencies += "com.typesafe.play" %% "play-iteratees-reactive-streams" % "2.6.1"
