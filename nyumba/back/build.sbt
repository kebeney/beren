name := """play-java-intro"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayJava)

scalaVersion := "2.11.8"

libraryDependencies += javaJpa

libraryDependencies ++= Seq(javaWs)

libraryDependencies += "org.mockito" % "mockito-core" % "2.1.0"

libraryDependencies += javaWs % "test"

libraryDependencies += "org.hibernate" % "hibernate-core" % "5.2.5.Final"

libraryDependencies += "org.postgresql" % "postgresql" % "42.0.0"

libraryDependencies += "org.mongodb" % "mongodb-driver" % "3.4.0"

libraryDependencies += "org.mongodb.morphia" % "morphia" % "1.3.2"

libraryDependencies += "io.jsonwebtoken" % "jjwt" % "0.7.0"

libraryDependencies += "com.auth0" % "java-jwt" % "3.2.0"

libraryDependencies += filters
